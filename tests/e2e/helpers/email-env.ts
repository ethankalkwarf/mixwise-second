/**
 * E2E email test environment helpers.
 * Live tests (tagged @live) require E2E_LIVE_EMAIL_TESTS=1 and secrets in .env.e2e
 */

export function getBaseUrl(): string {
  return (
    process.env.E2E_BASE_URL ||
    process.env.NEXT_PUBLIC_SITE_URL ||
    "http://localhost:3000"
  );
}

export function hasLiveEmailConfig(): boolean {
  return Boolean(
    process.env.E2E_LIVE_EMAIL_TESTS === "1" &&
      process.env.RESEND_API_KEY &&
      process.env.E2E_TEST_INBOX
  );
}

export function hasCronSecret(): boolean {
  return Boolean(process.env.CRON_SECRET);
}

export function uniqueTestEmail(): string {
  const inbox = process.env.E2E_TEST_INBOX || "e2e-test@example.com";
  const [local, domain] = inbox.split("@");
  const tag = `e2e${Date.now()}`;
  return domain ? `${local}+${tag}@${domain}` : `${tag}@example.com`;
}

export async function waitForResendDelivery(options: {
  to: string;
  subjectIncludes?: string;
  maxWaitMs?: number;
}): Promise<{ found: boolean; id?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return { found: false };

  const maxWait = options.maxWaitMs ?? 45_000;
  const started = Date.now();

  while (Date.now() - started < maxWait) {
    const res = await fetch("https://api.resend.com/emails", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });

    if (res.ok) {
      const body = (await res.json()) as {
        data?: Array<{ id: string; to: string[]; subject: string }>;
      };
      const match = (body.data || []).find((email) => {
        const toMatch = email.to?.some(
          (t) => t.toLowerCase() === options.to.toLowerCase()
        );
        const subjectMatch = options.subjectIncludes
          ? email.subject?.includes(options.subjectIncludes)
          : true;
        return toMatch && subjectMatch;
      });
      if (match) return { found: true, id: match.id };
    }

    await new Promise((r) => setTimeout(r, 3000));
  }

  return { found: false };
}
