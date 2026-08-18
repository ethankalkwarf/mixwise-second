/**
 * Sync the weekend kickoff campaign to Resend.
 *
 * Photos are email-sized JPEGs on getmixwise.com/email/weekend-kickoff/
 * (the same hosting pattern as /occasions/*.jpg).
 *
 * Usage:
 *   npx tsx scripts/sync-weekend-kickoff-resend.ts
 *   npx tsx scripts/sync-weekend-kickoff-resend.ts --skip-proof
 *   npx tsx scripts/sync-weekend-kickoff-resend.ts --sync-contacts
 */

import { config } from "dotenv";
config({ path: ".env.local" });

import { mkdirSync, writeFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { Resend } from "resend";
import { MIXWISE_FROM_EMAIL } from "../lib/email/resend";
import {
  WEEKEND_KICKOFF_DEFAULTS,
  WEEKEND_KICKOFF_PREVIEW,
  WEEKEND_KICKOFF_SUBJECT,
  WEEKEND_KICKOFF_TEMPLATE_ALIAS,
  firstNameFromDisplayName,
  weekendKickoffResendVariables,
  weekendKickoffTemplate,
} from "../lib/email/weekend-kickoff";

const PROOF_TO = process.env.PROOF_TO || "ethankalkwarf@gmail.com";
const FROM = process.env.RESEND_FROM_EMAIL || MIXWISE_FROM_EMAIL;
const GENERAL_SEGMENT_ID = "00b59ef5-ab0d-4516-a309-d45ad6ac74a7";
const BROADCAST_NAME = "Weekend Kickoff — Aug 14 2026";

const args = new Set(process.argv.slice(2));
const skipProof = args.has("--skip-proof");
const syncContacts = args.has("--sync-contacts");

async function main() {
  const apiKey = process.env.RESEND_API_KEY;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!apiKey) throw new Error("RESEND_API_KEY missing");
  if (!supabaseUrl || !serviceKey) throw new Error("Supabase env missing");

  const resend = new Resend(apiKey);
  const supabase = createClient(supabaseUrl, serviceKey, {
    auth: { autoRefreshToken: false, persistSession: false },
  });

  const content = WEEKEND_KICKOFF_DEFAULTS;
  for (const drink of [content.hero, content.saturday, content.saturdayNight, ...content.extras]) {
    console.log(`[weekend-kickoff] ${drink.name}: ${drink.imageUrl}`);
  }
  const templateHtml = weekendKickoffTemplate({ content, mode: "resend-template" });
  const broadcastEmail = weekendKickoffTemplate({ content, mode: "resend-broadcast" });
  const proofEmail = weekendKickoffTemplate({
    content,
    mode: "literal",
    firstName: "Ethan",
    userEmail: PROOF_TO,
    unsubscribeUrl: "https://www.getmixwise.com/unsubscribe?token=proof-preview&type=all",
  });

  mkdirSync("tmp/email-proofs", { recursive: true });
  writeFileSync("tmp/email-proofs/weekend-kickoff.html", proofEmail.html);

  const variables = weekendKickoffResendVariables(content);
  const existingTemplates = await resend.templates.list({ limit: 50 });
  const match = existingTemplates.data?.data.find(
    (row) => row.alias === WEEKEND_KICKOFF_TEMPLATE_ALIAS || row.name === "Weekend Kickoff"
  );

  let templateId = match?.id;
  const templatePayload = {
    name: "Weekend Kickoff",
    alias: WEEKEND_KICKOFF_TEMPLATE_ALIAS,
    from: FROM,
    subject: WEEKEND_KICKOFF_SUBJECT,
    html: templateHtml.html,
    text: templateHtml.text,
    replyTo: "hello@getmixwise.com",
    variables,
  };

  if (templateId) {
    const updated = await resend.templates.update(templateId, templatePayload);
    if (updated.error) throw new Error(updated.error.message);
    templateId = updated.data.id;
    console.log(`[weekend-kickoff] Updated Resend template ${templateId}`);
  } else {
    const created = await resend.templates.create(templatePayload);
    if (created.error) throw new Error(created.error.message);
    templateId = created.data.id;
    console.log(`[weekend-kickoff] Created Resend template ${templateId}`);
  }

  const published = await resend.templates.publish(templateId);
  if (published.error) {
    console.warn(`[weekend-kickoff] Publish warning: ${published.error.message}`);
  } else {
    console.log(`[weekend-kickoff] Published template ${templateId}`);
  }

  const existingBroadcasts = await resend.broadcasts.list({ limit: 20 });
  const drafts = (existingBroadcasts.data?.data || []).filter(
    (row) => row.name === BROADCAST_NAME && row.status === "draft"
  );
  const draft = drafts[0];

  let broadcastId = draft?.id;
  if (broadcastId) {
    const updated = await resend.broadcasts.update(broadcastId, {
      from: FROM,
      replyTo: ["hello@getmixwise.com"],
      subject: WEEKEND_KICKOFF_SUBJECT,
      previewText: WEEKEND_KICKOFF_PREVIEW,
      html: broadcastEmail.html,
      text: broadcastEmail.text,
    });
    if (updated.error) throw new Error(updated.error.message);
    console.log(`[weekend-kickoff] Updated draft broadcast ${broadcastId}`);
  } else {
    const created = await resend.broadcasts.create({
      name: BROADCAST_NAME,
      segmentId: GENERAL_SEGMENT_ID,
      from: FROM,
      replyTo: "hello@getmixwise.com",
      subject: WEEKEND_KICKOFF_SUBJECT,
      previewText: WEEKEND_KICKOFF_PREVIEW,
      html: broadcastEmail.html,
      text: broadcastEmail.text,
    });
    if (created.error) throw new Error(created.error.message);
    broadcastId = created.data?.id;
    console.log(`[weekend-kickoff] Draft broadcast ${broadcastId}`);
  }

  if (syncContacts) {
    const { data: profiles, error: profileError } = await supabase
      .from("profiles")
      .select("id, email, display_name")
      .not("email", "is", null);
    if (profileError) throw profileError;

    const userIds = (profiles || []).map((row) => row.id);
    const { data: prefs } = await supabase
      .from("email_preferences")
      .select("user_id, marketing_emails, unsubscribed_at")
      .in("user_id", userIds);

    const prefsByUser = new Map((prefs || []).map((row) => [row.user_id, row]));
    let imported = 0;
    for (const profile of profiles || []) {
      const email = profile.email?.trim().toLowerCase();
      if (!email) continue;
      const pref = prefsByUser.get(profile.id);
      if (pref?.marketing_emails === false) continue;

      const firstName = firstNameFromDisplayName(profile.display_name, email);
      const created = await resend.contacts.create({
        email,
        firstName,
        unsubscribed: false,
        audienceId: GENERAL_SEGMENT_ID,
      });
      if (created.error) {
        const updated = await resend.contacts.update({
          email,
          firstName,
          unsubscribed: false,
        });
        if (updated.error) {
          console.warn(`[weekend-kickoff] Contact ${email}: ${created.error.message}`);
          continue;
        }
        const added = await resend.contacts.segments.add({
          email,
          segmentId: GENERAL_SEGMENT_ID,
        });
        if (added.error) {
          console.warn(`[weekend-kickoff] Segment ${email}: ${added.error.message}`);
        }
      }
      imported += 1;
    }
    console.log(`[weekend-kickoff] Synced ${imported} contacts into the General segment`);
  }

  if (!skipProof) {
    const sent = await resend.emails.send({
      from: FROM,
      replyTo: "hello@getmixwise.com",
      to: PROOF_TO,
      subject: `[PROOF] ${WEEKEND_KICKOFF_SUBJECT}`,
      html: proofEmail.html,
      text: proofEmail.text,
      tags: [
        { name: "category", value: "weekend_kickoff" },
        { name: "environment", value: "proof" },
      ],
    });
    if (sent.error) throw new Error(sent.error.message);
    console.log(`[weekend-kickoff] Proof sent to ${PROOF_TO} — ${sent.data?.id}`);
  }

  console.log(`Template: https://resend.com/templates/${templateId}`);
  console.log(`Broadcast: https://resend.com/broadcasts/${broadcastId}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
