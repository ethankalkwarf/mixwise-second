/**
 * Google Search Console → Supabase sync (off-site query demand).
 */

import { createClient } from "@supabase/supabase-js";

type GscRow = {
  keys?: string[];
  clicks?: number;
  impressions?: number;
  ctr?: number;
  position?: number;
};

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing ${name}`);
  return v;
}

function pemKey(): string {
  return requireEnv("GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY").replace(/\\n/g, "\n");
}

async function getAccessToken(): Promise<string> {
  const email = requireEnv("GOOGLE_SERVICE_ACCOUNT_EMAIL");
  const key = pemKey();
  const now = Math.floor(Date.now() / 1000);
  const header = Buffer.from(JSON.stringify({ alg: "RS256", typ: "JWT" })).toString(
    "base64url"
  );
  const claim = Buffer.from(
    JSON.stringify({
      iss: email,
      scope: "https://www.googleapis.com/auth/webmasters.readonly",
      aud: "https://oauth2.googleapis.com/token",
      iat: now,
      exp: now + 3600,
    })
  ).toString("base64url");

  const { createSign } = await import("crypto");
  const sign = createSign("RSA-SHA256");
  sign.update(`${header}.${claim}`);
  sign.end();
  const signature = sign.sign(key, "base64url");
  const jwt = `${header}.${claim}.${signature}`;

  const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });
  if (!tokenRes.ok) {
    throw new Error(`GSC token failed: ${tokenRes.status} ${await tokenRes.text()}`);
  }
  const json = (await tokenRes.json()) as { access_token: string };
  return json.access_token;
}

function dateOffset(days: number): string {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().slice(0, 10);
}

export async function syncSearchConsole(daysBack = 7): Promise<{ upserted: number }> {
  const siteUrl = process.env.GSC_SITE_URL || "https://www.getmixwise.com/";
  const token = await getAccessToken();
  const startDate = dateOffset(daysBack + 2);
  const endDate = dateOffset(2);

  const apiUrl = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(
    siteUrl
  )}/searchAnalytics/query`;

  const res = await fetch(apiUrl, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      startDate,
      endDate,
      dimensions: ["date", "query", "page"],
      rowLimit: 25000,
      dataState: "all",
    }),
  });

  if (!res.ok) {
    throw new Error(`GSC query failed: ${res.status} ${await res.text()}`);
  }

  const data = (await res.json()) as { rows?: GscRow[] };
  const rows = data.rows || [];

  const supabaseUrl =
    process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceKey) {
    throw new Error("Missing Supabase admin env for GSC sync");
  }
  const supabase = createClient(supabaseUrl, serviceKey);

  const payload = rows.map((row) => {
    const [date, query, page] = row.keys || ["", "", ""];
    return {
      date,
      query: query || "",
      page: page || "",
      clicks: row.clicks || 0,
      impressions: row.impressions || 0,
      ctr: row.ctr ?? null,
      position: row.position ?? null,
    };
  });

  let upserted = 0;
  const chunk = 500;
  for (let i = 0; i < payload.length; i += chunk) {
    const slice = payload.slice(i, i + chunk);
    const { error, count } = await supabase
      .from("search_console_daily")
      .upsert(slice, { onConflict: "date,query,page", count: "exact" });
    if (error) throw new Error(error.message);
    upserted += count ?? slice.length;
  }

  return { upserted };
}
