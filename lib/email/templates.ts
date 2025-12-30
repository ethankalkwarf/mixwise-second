/**
 * Email Templates
 *
 * HTML email templates for MixWise authentication flows.
 * All templates include both HTML and plain text versions.
 */

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

/**
 * Email confirmation template for new user signup
 */
export function confirmEmailTemplate({
  confirmUrl,
  userEmail,
}: {
  confirmUrl: string;
  userEmail: string;
}): EmailTemplate {
  const subject = "Confirm your MixWise account";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Confirm your MixWise account</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa; }
    .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
    .header { background: linear-gradient(135deg, #8b5a3c 0%, #a67c52 100%); padding: 40px 30px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 28px; font-weight: 600; }
    .content { padding: 40px 30px; color: #374151; line-height: 1.6; }
    .content h2 { color: #1f2937; margin-top: 0; margin-bottom: 20px; font-size: 20px; }
    .button { display: inline-block; background: linear-gradient(135deg, #8b5a3c 0%, #a67c52 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; margin: 20px 0; box-shadow: 0 2px 4px rgba(139, 90, 60, 0.2); }
    .button:hover { background: linear-gradient(135deg, #7a4e33 0%, #967048 100%); }
    .footer { background-color: #f9fafb; padding: 20px 30px; text-align: center; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb; }
    .fallback-link { word-break: break-all; color: #8b5a3c; background-color: #fef3e7; padding: 12px; border-radius: 6px; margin: 16px 0; display: inline-block; font-family: monospace; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>mixwise.</h1>
    </div>
    <div class="content">
      <h2>Welcome to MixWise!</h2>
      <p>You're just one step away from unlocking personalized cocktail recommendations, saving your favorite recipes, and building your home bar inventory.</p>
      <p>Please confirm your email address to get started:</p>
      <div style="text-align: center;">
        <a href="${confirmUrl}" class="button">Confirm Your Email</a>
      </div>
      <p><strong>Didn't request this?</strong> You can safely ignore this email.</p>
      <p>If the button doesn't work, copy and paste this link into your browser:</p>
      <div class="fallback-link">${confirmUrl}</div>
    </div>
    <div class="footer">
      <p>This email was sent to ${userEmail}. If you didn't sign up for MixWise, please disregard this message.</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  const text = `
Welcome to MixWise!

You're just one step away from unlocking personalized cocktail recommendations, saving your favorite recipes, and building your home bar inventory.

Please confirm your email address by clicking this link:
${confirmUrl}

Didn't request this? You can safely ignore this email.

This email was sent to ${userEmail}. If you didn't sign up for MixWise, please disregard this message.
  `.trim();

  return { subject, html, text };
}

/**
 * Password reset template for password recovery
 */
export function resetPasswordTemplate({
  resetUrl,
  userEmail,
}: {
  resetUrl: string;
  userEmail: string;
}): EmailTemplate {
  const subject = "Reset your MixWise password";

  const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Reset your MixWise password</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 0; background-color: #f8f9fa; }
    .container { max-width: 600px; margin: 0 auto; background-color: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1); }
    .header { background: linear-gradient(135deg, #8b5a3c 0%, #a67c52 100%); padding: 40px 30px; text-align: center; }
    .header h1 { color: white; margin: 0; font-size: 28px; font-weight: 600; }
    .content { padding: 40px 30px; color: #374151; line-height: 1.6; }
    .content h2 { color: #1f2937; margin-top: 0; margin-bottom: 20px; font-size: 20px; }
    .button { display: inline-block; background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); color: white; text-decoration: none; padding: 16px 32px; border-radius: 8px; font-weight: 600; margin: 20px 0; box-shadow: 0 2px 4px rgba(220, 38, 38, 0.2); }
    .button:hover { background: linear-gradient(135deg, #b91c1c 0%, #991b1b 100%); }
    .footer { background-color: #f9fafb; padding: 20px 30px; text-align: center; color: #6b7280; font-size: 14px; border-top: 1px solid #e5e7eb; }
    .fallback-link { word-break: break-all; color: #dc2626; background-color: #fef2f2; padding: 12px; border-radius: 6px; margin: 16px 0; display: inline-block; font-family: monospace; font-size: 14px; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>mixwise.</h1>
    </div>
    <div class="content">
      <h2>Reset your password</h2>
      <p>We received a request to reset your password for your MixWise account. If you made this request, click the button below to set a new password.</p>
      <p><strong>This link will expire in 1 hour for security reasons.</strong></p>
      <div style="text-align: center;">
        <a href="${resetUrl}" class="button">Reset Your Password</a>
      </div>
      <p><strong>Didn't request this?</strong> You can safely ignore this email. Your password will remain unchanged.</p>
      <p>If the button doesn't work, copy and paste this link into your browser:</p>
      <div class="fallback-link">${resetUrl}</div>
    </div>
    <div class="footer">
      <p>This email was sent to ${userEmail}. If you didn't request a password reset, please disregard this message.</p>
    </div>
  </div>
</body>
</html>
  `.trim();

  const text = `
Reset your MixWise password

We received a request to reset your password for your MixWise account. If you made this request, click this link to set a new password:

${resetUrl}

This link will expire in 1 hour for security reasons.

Didn't request this? You can safely ignore this email. Your password will remain unchanged.

This email was sent to ${userEmail}. If you didn't request a password reset, please disregard this message.
  `.trim();

  return { subject, html, text };
}
