/**
 * Standalone email theme variants for visual comparison.
 * Same sample content in each — pick a winner, then apply system-wide.
 */

export type EmailThemeId =
  | "studio-white"
  | "forest-masthead"
  | "ink-letter"
  | "hard-grid"
  | "night-bar";

export type EmailThemeVariant = {
  id: EmailThemeId;
  name: string;
  inspiredBy: string;
  summary: string;
  html: string;
};

const SITE = "https://www.getmixwise.com";
const LOGO_DARK = `${SITE}/brand/mixwise-lockup.png?v=20260820c`;
const LOGO_CREAM = `${SITE}/brand/mixwise-lockup-cream.png?v=20260820c`;
const HERO =
  "https://ehexkpoxir62prtp.public.blob.vercel-storage.com/email/weekend-kickoff/limoncello-spritz-lMpa2ARSjsMZmQUqiFp96u54glmy2e.jpg";

const SAMPLE = {
  name: "Ethan",
  drink: "Limoncello Spritz",
  blurb: "Bright, bitter, and cold. The kind of drink that makes a Friday feel longer.",
  href: `${SITE}/cocktails/limoncello-spritz`,
  cta: "See what you can mix",
  ctaHref: `${SITE}/mix`,
  email: "ethan@getmixwise.com",
};

function preheader(text: string): string {
  const pad = "&nbsp;".repeat(80) + "&zwnj;".repeat(40);
  return `<div style="display:none;font-size:1px;color:#fff;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">${text}${pad}</div>`;
}

function shell(title: string, bodyBg: string, inner: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title}</title>
</head>
<body style="margin:0;padding:0;background-color:${bodyBg};">
  ${preheader("Happy Friday — a Limoncello Spritz to start the weekend.")}
  ${inner}
</body>
</html>`;
}

/** 1. Apple / Airbnb restraint — white field, bleed photo, quiet type */
function studioWhite(): string {
  return shell(
    "Studio White",
    "#FFFFFF",
    `
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#FFFFFF;">
    <tr><td align="center">
      <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:600px;background:#FFFFFF;">
        <tr>
          <td style="padding:40px 48px 24px 48px;">
            <a href="${SITE}" style="text-decoration:none;line-height:0;">
              <img src="${LOGO_DARK}" alt="mixwise" width="120" style="display:block;width:120px;height:auto;border:0;" />
            </a>
          </td>
        </tr>
        <tr>
          <td style="padding:0 48px 8px 48px;">
            <h1 style="margin:0 0 12px 0;font-family:Georgia,'Times New Roman',serif;font-size:36px;line-height:1.12;font-weight:400;letter-spacing:-0.02em;color:#111111;">
              Happy Friday, ${SAMPLE.name}
            </h1>
            <p style="margin:0 0 28px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:17px;line-height:1.55;color:#333333;">
              If your AC is working overtime, your shaker should be too.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:0 48px;line-height:0;">
            <a href="${SAMPLE.href}" style="display:block;line-height:0;">
              <img src="${HERO}" alt="${SAMPLE.drink}" width="504" style="display:block;width:100%;max-width:504px;height:auto;border:0;" />
            </a>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 48px 8px 48px;">
            <p style="margin:0 0 6px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:12px;font-weight:600;letter-spacing:0.04em;color:#777777;">Friday</p>
            <h2 style="margin:0 0 10px 0;font-family:Georgia,'Times New Roman',serif;font-size:28px;line-height:1.15;font-weight:400;color:#111111;">${SAMPLE.drink}</h2>
            <p style="margin:0 0 16px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:16px;line-height:1.55;color:#333333;">${SAMPLE.blurb}</p>
            <p style="margin:0 0 36px 0;">
              <a href="${SAMPLE.href}" style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:15px;font-weight:600;color:#111111;text-decoration:none;border-bottom:1px solid #111111;">View recipe</a>
            </p>
            <a href="${SAMPLE.ctaHref}" style="display:inline-block;background:#111111;color:#FFFFFF;text-decoration:none;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:15px;font-weight:600;padding:14px 24px;border-radius:0;">${SAMPLE.cta}</a>
            <p style="margin:40px 0 0 0;font-family:Georgia,'Times New Roman',serif;font-size:17px;color:#111111;">— Ethan</p>
          </td>
        </tr>
        <tr>
          <td style="padding:40px 48px 48px 48px;">
            <div style="height:1px;background:#E8E8E8;line-height:1px;font-size:1px;">&nbsp;</div>
            <p style="margin:20px 0 0 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:12px;color:#999999;line-height:1.5;">
              Sent to ${SAMPLE.email}<br>
              <a href="${SITE}" style="color:#999999;text-decoration:none;">getmixwise.com</a>
              &nbsp;·&nbsp;
              <a href="${SITE}/unsubscribe" style="color:#999999;text-decoration:none;">Unsubscribe</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>`
  );
}

/** 2. Brand-forward forest header — classic premium newsletter masthead */
function forestMasthead(): string {
  return shell(
    "Forest Masthead",
    "#F3F0E8",
    `
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#F3F0E8;">
    <tr><td align="center" style="padding:32px 16px;">
      <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:600px;background:#FFFFFF;">
        <tr>
          <td bgcolor="#3A4D39" style="background-color:#3A4D39;padding:36px 40px;text-align:center;">
            <a href="${SITE}" style="text-decoration:none;line-height:0;">
              <img src="${LOGO_CREAM}" alt="mixwise" width="148" style="display:block;margin:0 auto;width:148px;height:auto;border:0;" />
            </a>
          </td>
        </tr>
        <tr>
          <td style="padding:40px 40px 12px 40px;">
            <h1 style="margin:0 0 14px 0;font-family:Georgia,'Times New Roman',serif;font-size:30px;line-height:1.2;font-weight:400;color:#3A4D39;text-align:center;">
              Happy Friday, ${SAMPLE.name}
            </h1>
            <p style="margin:0 0 28px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:16px;line-height:1.6;color:#2C3628;text-align:center;">
              If your AC is working overtime, your shaker should be too.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:0 24px;">
            <img src="${HERO}" alt="${SAMPLE.drink}" width="552" style="display:block;width:100%;max-width:552px;height:auto;border:0;border-radius:4px;" />
          </td>
        </tr>
        <tr>
          <td style="padding:24px 40px 8px 40px;text-align:center;">
            <p style="margin:0 0 6px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#5F6F5E;">Friday</p>
            <h2 style="margin:0 0 10px 0;font-family:Georgia,'Times New Roman',serif;font-size:26px;font-weight:400;color:#3A4D39;">${SAMPLE.drink}</h2>
            <p style="margin:0 0 22px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.6;color:#2C3628;">${SAMPLE.blurb}</p>
            <a href="${SAMPLE.ctaHref}" style="display:inline-block;background:#BC5A45;color:#FFFFFF;text-decoration:none;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:15px;font-weight:600;padding:14px 28px;border-radius:4px;">${SAMPLE.cta}</a>
            <p style="margin:36px 0 0 0;font-family:Georgia,'Times New Roman',serif;font-size:16px;color:#3A4D39;">— Ethan at MixWise</p>
          </td>
        </tr>
        <tr>
          <td bgcolor="#E6EBE4" style="background-color:#E6EBE4;padding:28px 40px;text-align:center;">
            <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:12px;color:#5F6F5E;line-height:1.5;">
              Sent to ${SAMPLE.email}<br>
              © 2026 MixWise · <a href="${SITE}/unsubscribe" style="color:#5F6F5E;">Unsubscribe</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>`
  );
}

/** 3. Personal letter — almost no chrome; Notion / founder-note energy */
function inkLetter(): string {
  return shell(
    "Ink Letter",
    "#FFFFFF",
    `
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#FFFFFF;">
    <tr><td align="center">
      <table role="presentation" width="560" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:560px;">
        <tr>
          <td style="padding:48px 32px 0 32px;font-family:Georgia,'Times New Roman',serif;font-size:15px;line-height:1.65;color:#222222;">
            <p style="margin:0 0 28px 0;">
              <a href="${SITE}" style="color:#222222;text-decoration:none;font-weight:600;letter-spacing:0.02em;">mixwise</a>
            </p>
            <p style="margin:0 0 20px 0;">Hi ${SAMPLE.name},</p>
            <p style="margin:0 0 20px 0;">
              Happy Friday. If your AC is working overtime, your shaker should be too.
            </p>
            <p style="margin:0 0 8px 0;">
              Tonight I'd make a <a href="${SAMPLE.href}" style="color:#222222;font-weight:600;">${SAMPLE.drink}</a>.
            </p>
            <p style="margin:0 0 24px 0;color:#444444;">${SAMPLE.blurb}</p>
          </td>
        </tr>
        <tr>
          <td style="padding:0 32px;line-height:0;">
            <a href="${SAMPLE.href}" style="display:block;line-height:0;">
              <img src="${HERO}" alt="${SAMPLE.drink}" width="496" style="display:block;width:100%;max-width:496px;height:auto;border:0;" />
            </a>
          </td>
        </tr>
        <tr>
          <td style="padding:24px 32px 48px 32px;font-family:Georgia,'Times New Roman',serif;font-size:15px;line-height:1.65;color:#222222;">
            <p style="margin:0 0 28px 0;">
              <a href="${SAMPLE.ctaHref}" style="color:#222222;font-weight:600;text-decoration:underline;">${SAMPLE.cta} →</a>
            </p>
            <p style="margin:0 0 4px 0;">Cheers,</p>
            <p style="margin:0 0 40px 0;">Ethan</p>
            <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:12px;color:#999999;line-height:1.5;">
              ${SAMPLE.email} · <a href="${SITE}/unsubscribe" style="color:#999999;">Unsubscribe</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>`
  );
}

/** 4. Hard-outline magazine blocks — RGE / Mailchimp editorial structure */
function hardGrid(): string {
  const ink = "#1A1A1A";
  return shell(
    "Hard Grid",
    "#FFFFFF",
    `
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#FFFFFF;">
    <tr><td align="center" style="padding:24px 12px;">
      <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:600px;border:2px solid ${ink};">
        <tr>
          <td style="padding:20px 24px;border-bottom:2px solid ${ink};">
            <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
              <tr>
                <td>
                  <a href="${SITE}" style="text-decoration:none;line-height:0;">
                    <img src="${LOGO_DARK}" alt="mixwise" width="110" style="display:block;width:110px;height:auto;border:0;" />
                  </a>
                </td>
                <td align="right" style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.14em;text-transform:uppercase;color:${ink};">
                  Weekend
                </td>
              </tr>
            </table>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 24px;border-bottom:2px solid ${ink};">
            <h1 style="margin:0 0 10px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:32px;line-height:1.1;font-weight:800;letter-spacing:-0.03em;color:${ink};">
              Happy Friday,<br>${SAMPLE.name}.
            </h1>
            <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:16px;line-height:1.5;color:${ink};">
              If your AC is working overtime, your shaker should be too.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:0 24px;line-height:0;border-bottom:2px solid ${ink};">
            <a href="${SAMPLE.href}" style="display:block;line-height:0;">
              <img src="${HERO}" alt="${SAMPLE.drink}" width="548" style="display:block;width:100%;max-width:548px;height:auto;border:0;" />
            </a>
          </td>
        </tr>
        <tr>
          <td style="padding:24px;border-bottom:2px solid ${ink};">
            <p style="margin:0 0 4px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:${ink};">01 · Friday</p>
            <h2 style="margin:0 0 8px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:24px;font-weight:800;letter-spacing:-0.02em;color:${ink};">${SAMPLE.drink}</h2>
            <p style="margin:0 0 16px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.5;color:${ink};">${SAMPLE.blurb}</p>
            <a href="${SAMPLE.href}" style="display:inline-block;border:2px solid ${ink};color:${ink};text-decoration:none;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:13px;font-weight:700;letter-spacing:0.04em;text-transform:uppercase;padding:10px 16px;">View recipe</a>
          </td>
        </tr>
        <tr>
          <td bgcolor="${ink}" style="background-color:${ink};padding:24px;text-align:center;">
            <a href="${SAMPLE.ctaHref}" style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:14px;font-weight:700;letter-spacing:0.06em;text-transform:uppercase;color:#FFFFFF;text-decoration:none;">${SAMPLE.cta} →</a>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 24px;">
            <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:12px;color:#555555;line-height:1.5;">
              — Ethan · Sent to ${SAMPLE.email} · <a href="${SITE}/unsubscribe" style="color:#555555;">Unsubscribe</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>`
  );
}

/** 5. Dark cocktail-bar — charcoal field, cream mark, lime accent */
function nightBar(): string {
  return shell(
    "Night Bar",
    "#141914",
    `
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#141914;">
    <tr><td align="center" style="padding:28px 12px;">
      <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" style="width:100%;max-width:600px;background:#1C241B;">
        <tr>
          <td style="padding:36px 40px 20px 40px;">
            <a href="${SITE}" style="text-decoration:none;line-height:0;">
              <img src="${LOGO_CREAM}" alt="mixwise" width="132" style="display:block;width:132px;height:auto;border:0;" />
            </a>
          </td>
        </tr>
        <tr>
          <td style="padding:8px 40px 24px 40px;">
            <p style="margin:0 0 10px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:12px;font-weight:600;letter-spacing:0.14em;text-transform:uppercase;color:#C5D46A;">Weekend kickoff</p>
            <h1 style="margin:0 0 12px 0;font-family:Georgia,'Times New Roman',serif;font-size:34px;line-height:1.15;font-weight:400;color:#F9F7F2;">
              Happy Friday, ${SAMPLE.name}
            </h1>
            <p style="margin:0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:16px;line-height:1.55;color:#C8CFC4;">
              If your AC is working overtime, your shaker should be too.
            </p>
          </td>
        </tr>
        <tr>
          <td style="padding:0 40px;line-height:0;">
            <a href="${SAMPLE.href}" style="display:block;line-height:0;">
              <img src="${HERO}" alt="${SAMPLE.drink}" width="520" style="display:block;width:100%;max-width:520px;height:auto;border:0;" />
            </a>
          </td>
        </tr>
        <tr>
          <td style="padding:28px 40px 12px 40px;">
            <h2 style="margin:0 0 10px 0;font-family:Georgia,'Times New Roman',serif;font-size:28px;font-weight:400;color:#F9F7F2;">${SAMPLE.drink}</h2>
            <p style="margin:0 0 22px 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:15px;line-height:1.55;color:#C8CFC4;">${SAMPLE.blurb}</p>
            <a href="${SAMPLE.ctaHref}" style="display:inline-block;background:#C5D46A;color:#1C241B;text-decoration:none;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:15px;font-weight:700;padding:14px 24px;border-radius:2px;">${SAMPLE.cta}</a>
            <p style="margin:36px 0 0 0;font-family:Georgia,'Times New Roman',serif;font-size:16px;color:#F9F7F2;">— Ethan</p>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 40px 40px 40px;">
            <div style="height:1px;background:#2F3B2E;line-height:1px;font-size:1px;">&nbsp;</div>
            <p style="margin:18px 0 0 0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Helvetica,Arial,sans-serif;font-size:12px;color:#8A9488;line-height:1.5;">
              Sent to ${SAMPLE.email}<br>
              <a href="${SITE}" style="color:#8A9488;text-decoration:none;">getmixwise.com</a>
              &nbsp;·&nbsp;
              <a href="${SITE}/unsubscribe" style="color:#8A9488;text-decoration:none;">Unsubscribe</a>
            </p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>`
  );
}

export function buildEmailThemeVariants(): EmailThemeVariant[] {
  return [
    {
      id: "studio-white",
      name: "Studio White",
      inspiredBy: "Apple · Airbnb",
      summary: "White field, inset photo aligned to copy, quiet type, black CTA. Photography does the talking.",
      html: studioWhite(),
    },
    {
      id: "forest-masthead",
      name: "Forest Masthead",
      inspiredBy: "Classic brand newsletter",
      summary: "Solid forest header with cream logo, centered layout, terracotta button. Most “on-brand” at a glance.",
      html: forestMasthead(),
    },
    {
      id: "ink-letter",
      name: "Ink Letter",
      inspiredBy: "Notion · founder notes",
      summary: "Reads like Ethan emailed you. Minimal chrome, serif body, underlined links.",
      html: inkLetter(),
    },
    {
      id: "hard-grid",
      name: "Hard Grid",
      inspiredBy: "Really Good Emails · Mailchimp editorial",
      summary: "2px ink outlines, bold sans headlines, magazine sections. Structured and graphic.",
      html: hardGrid(),
    },
    {
      id: "night-bar",
      name: "Night Bar",
      inspiredBy: "Dark-mode cocktail bar",
      summary: "Charcoal canvas, cream lockup, lime CTA. Evening energy; stands out in the inbox.",
      html: nightBar(),
    },
  ];
}
