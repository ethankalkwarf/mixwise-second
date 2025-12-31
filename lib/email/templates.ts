/**
 * Email Templates
 *
 * HTML email templates for MixWise authentication flows.
 * All templates include both HTML and plain text versions.
 * 
 * Brand colors (Botanical Garden theme):
 * - Cream: #F9F7F2 (background)
 * - Mist: #E6EBE4 (subtle background)
 * - Forest: #3A4D39 (headings, primary text)
 * - Charcoal: #2C3628 (dark text)
 * - Sage: #5F6F5E (muted text)
 * - Terracotta: #BC5A45 (primary button, accents)
 * - Olive: #8A9A5B (secondary accent)
 * - Stone: #D1DAD0 (borders)
 * 
 * Typography:
 * - Headings: DM Serif Display (fallback: Georgia, serif)
 * - Body: Jost (fallback: system-ui, sans-serif)
 */

export interface EmailTemplate {
  subject: string;
  html: string;
  text: string;
}

// Common CSS styles for all email templates
const baseStyles = `
  <style>
    /* Reset and base */
    body, html {
      margin: 0;
      padding: 0;
      width: 100%;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
    }
    
    body {
      font-family: 'Jost', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #F9F7F2;
      color: #2C3628;
      line-height: 1.65;
    }
    
    .email-wrapper {
      width: 100%;
      background-color: #F9F7F2;
      padding: 40px 20px;
    }
    
    .email-container {
      max-width: 560px;
      margin: 0 auto;
      background-color: #FFFFFF;
      border-radius: 24px;
      overflow: hidden;
      box-shadow: 0 8px 30px -8px rgba(0, 0, 0, 0.1);
      border: 1px solid #E6EBE4;
    }
    
    /* Header with botanical gradient */
    .email-header {
      background: linear-gradient(135deg, #3A4D39 0%, #5F6F5E 100%);
      padding: 48px 40px;
      text-align: center;
      position: relative;
      overflow: hidden;
    }
    
    .email-header::before {
      content: '';
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      background: radial-gradient(circle at 20% 80%, rgba(188, 90, 69, 0.15) 0%, transparent 50%),
                  radial-gradient(circle at 80% 20%, rgba(138, 154, 91, 0.15) 0%, transparent 50%);
      pointer-events: none;
    }
    
    .logo {
      font-family: 'DM Serif Display', Georgia, 'Times New Roman', serif;
      font-size: 36px;
      font-weight: 700;
      color: #FFFFFF;
      margin: 0;
      letter-spacing: -0.5px;
      position: relative;
      z-index: 1;
    }
    
    .logo-dot {
      color: #BC5A45;
    }
    
    /* Content area */
    .email-content {
      padding: 48px 40px;
    }
    
    .greeting {
      font-family: Georgia, 'Times New Roman', serif;
      font-size: 24px;
      color: #3A4D39;
      margin: 0 0 24px 0;
      font-weight: 400;
      line-height: 1.3;
    }
    
    .body-text {
      font-size: 16px;
      color: #2C3628;
      margin: 0 0 20px 0;
      line-height: 1.65;
    }
    
    .muted-text {
      font-size: 14px;
      color: #5F6F5E;
      margin: 0 0 16px 0;
      line-height: 1.6;
    }
    
    /* Primary CTA Button */
    .button-wrapper {
      text-align: center;
      margin: 32px 0;
    }
    
    .btn-primary {
      display: inline-block;
      background: linear-gradient(135deg, #BC5A45 0%, #A04532 100%);
      color: #FFFFFF !important;
      text-decoration: none;
      padding: 18px 40px;
      border-radius: 50px;
      font-weight: 600;
      font-size: 16px;
      letter-spacing: 0.3px;
      box-shadow: 0 10px 25px -5px rgba(188, 90, 69, 0.3);
      transition: all 0.3s ease;
    }
    
    .btn-primary:hover {
      background: linear-gradient(135deg, #A04532 0%, #8B3A28 100%);
      box-shadow: 0 12px 30px -5px rgba(188, 90, 69, 0.4);
    }
    
    /* Warning/Reset button (slightly different styling) */
    .btn-warning {
      display: inline-block;
      background: linear-gradient(135deg, #3A4D39 0%, #2C3628 100%);
      color: #FFFFFF !important;
      text-decoration: none;
      padding: 18px 40px;
      border-radius: 50px;
      font-weight: 600;
      font-size: 16px;
      letter-spacing: 0.3px;
      box-shadow: 0 10px 25px -5px rgba(58, 77, 57, 0.3);
    }
    
    /* Fallback link box */
    .fallback-box {
      background-color: #E6EBE4;
      border-radius: 12px;
      padding: 16px 20px;
      margin: 24px 0;
      border: 1px solid #D1DAD0;
    }
    
    .fallback-label {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #5F6F5E;
      margin: 0 0 8px 0;
    }
    
    .fallback-link {
      word-break: break-all;
      font-family: 'SF Mono', Monaco, 'Cascadia Code', Consolas, monospace;
      font-size: 13px;
      color: #BC5A45;
      line-height: 1.5;
    }
    
    /* Divider */
    .divider {
      height: 1px;
      background: linear-gradient(90deg, transparent, #D1DAD0, transparent);
      margin: 32px 0;
    }
    
    /* Info box */
    .info-box {
      background-color: #F9F7F2;
      border-radius: 12px;
      padding: 20px;
      margin: 24px 0;
      border-left: 4px solid #8A9A5B;
    }
    
    .info-box p {
      margin: 0;
      font-size: 14px;
      color: #3A4D39;
    }
    
    /* Footer */
    .email-footer {
      background-color: #E6EBE4;
      padding: 32px 40px;
      text-align: center;
      border-top: 1px solid #D1DAD0;
    }
    
    .footer-text {
      font-size: 13px;
      color: #5F6F5E;
      margin: 0 0 12px 0;
      line-height: 1.5;
    }
    
    .footer-links {
      margin: 16px 0 0 0;
    }
    
    .footer-link {
      color: #3A4D39;
      text-decoration: none;
      font-size: 13px;
      margin: 0 12px;
    }
    
    .footer-link:hover {
      color: #BC5A45;
    }
    
    /* Cocktail decoration */
    .cocktail-icon {
      font-size: 48px;
      margin-bottom: 16px;
    }
    
    /* Highlight text */
    .highlight {
      color: #BC5A45;
      font-weight: 600;
    }
    
    /* Security notice */
    .security-notice {
      background-color: #FEF3E7;
      border: 1px solid #F5D5BC;
      border-radius: 12px;
      padding: 16px 20px;
      margin: 24px 0;
    }
    
    .security-notice p {
      margin: 0;
      font-size: 14px;
      color: #8B3A28;
    }
    
    /* Mobile responsive */
    @media only screen and (max-width: 600px) {
      .email-wrapper {
        padding: 20px 12px;
      }
      
      .email-content,
      .email-footer {
        padding: 32px 24px;
      }
      
      .email-header {
        padding: 36px 24px;
      }
      
      .greeting {
        font-size: 20px;
      }
      
      .btn-primary,
      .btn-warning {
        padding: 16px 32px;
        font-size: 15px;
      }
    }
  </style>
`;

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
  const subject = "Welcome to MixWise – Confirm Your Email 🍸";

  const html = `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no">
  <title>Welcome to MixWise – Confirm Your Email</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  ${baseStyles}
</head>
<body>
  <div class="email-wrapper">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" class="email-container" style="max-width: 560px; margin: 0 auto; background-color: #FFFFFF; border-radius: 24px; overflow: hidden; box-shadow: 0 8px 30px -8px rgba(0, 0, 0, 0.1); border: 1px solid #E6EBE4;">
      
      <!-- Header -->
      <tr>
        <td class="email-header" style="background: linear-gradient(135deg, #3A4D39 0%, #5F6F5E 100%); padding: 48px 40px; text-align: center;">
          <h1 class="logo" style="font-family: 'DM Serif Display', Georgia, 'Times New Roman', serif; font-size: 36px; font-weight: 700; color: #FFFFFF; margin: 0; letter-spacing: -0.5px;">
            mixwise<span class="logo-dot" style="color: #BC5A45;">.</span>
          </h1>
        </td>
      </tr>
      
      <!-- Content -->
      <tr>
        <td class="email-content" style="padding: 48px 40px;">
          <div class="cocktail-icon" style="text-align: center; font-size: 48px; margin-bottom: 24px;">🍹</div>
          
          <h2 class="greeting" style="font-family: Georgia, 'Times New Roman', serif; font-size: 24px; color: #3A4D39; margin: 0 0 24px 0; font-weight: 400; text-align: center;">
            Welcome to MixWise!
          </h2>
          
          <p class="body-text" style="font-size: 16px; color: #2C3628; margin: 0 0 20px 0; line-height: 1.65;">
            You're just one step away from discovering your next favorite cocktail. Confirm your email to unlock:
          </p>
          
          <div class="info-box" style="background-color: #F9F7F2; border-radius: 12px; padding: 20px; margin: 24px 0; border-left: 4px solid #8A9A5B;">
            <p style="margin: 0 0 8px 0; font-size: 14px; color: #3A4D39;">✦ <strong>Personalized recommendations</strong> based on your taste</p>
            <p style="margin: 0 0 8px 0; font-size: 14px; color: #3A4D39;">✦ <strong>Save your favorite recipes</strong> for easy access</p>
            <p style="margin: 0; font-size: 14px; color: #3A4D39;">✦ <strong>Build your home bar inventory</strong> and see what you can make</p>
          </div>
          
          <div class="button-wrapper" style="text-align: center; margin: 32px 0;">
            <a href="${confirmUrl}" class="btn-primary" style="display: inline-block; background: linear-gradient(135deg, #BC5A45 0%, #A04532 100%); color: #FFFFFF; text-decoration: none; padding: 18px 40px; border-radius: 50px; font-weight: 600; font-size: 16px; box-shadow: 0 10px 25px -5px rgba(188, 90, 69, 0.3);">
              Confirm Your Email
            </a>
          </div>
          
          <div class="divider" style="height: 1px; background: linear-gradient(90deg, transparent, #D1DAD0, transparent); margin: 32px 0;"></div>
          
          <div class="fallback-box" style="background-color: #E6EBE4; border-radius: 12px; padding: 16px 20px; margin: 24px 0; border: 1px solid #D1DAD0;">
            <p class="fallback-label" style="font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #5F6F5E; margin: 0 0 8px 0;">
              Or copy this link:
            </p>
            <p class="fallback-link" style="word-break: break-all; font-family: monospace; font-size: 13px; color: #BC5A45; margin: 0; line-height: 1.5;">
              ${confirmUrl}
            </p>
          </div>
          
          <p class="muted-text" style="font-size: 14px; color: #5F6F5E; margin: 24px 0 0 0; line-height: 1.6; text-align: center;">
            Didn't sign up for MixWise? You can safely ignore this email.
          </p>
        </td>
      </tr>
      
      <!-- Footer -->
      <tr>
        <td class="email-footer" style="background-color: #E6EBE4; padding: 32px 40px; text-align: center; border-top: 1px solid #D1DAD0;">
          <p class="footer-text" style="font-size: 13px; color: #5F6F5E; margin: 0 0 12px 0;">
            This email was sent to <strong>${userEmail}</strong>
          </p>
          <p class="footer-text" style="font-size: 13px; color: #5F6F5E; margin: 0;">
            © ${new Date().getFullYear()} MixWise · A smarter way to make cocktails at home
          </p>
          <div class="footer-links" style="margin: 16px 0 0 0;">
            <a href="https://www.getmixwise.com" class="footer-link" style="color: #3A4D39; text-decoration: none; font-size: 13px;">Visit MixWise</a>
          </div>
        </td>
      </tr>
      
    </table>
  </div>
</body>
</html>
  `.trim();

  const text = `
Welcome to MixWise! 🍹

You're just one step away from discovering your next favorite cocktail.

Confirm your email to unlock:
✦ Personalized recommendations based on your taste
✦ Save your favorite recipes for easy access
✦ Build your home bar inventory and see what you can make

Click this link to confirm your email:
${confirmUrl}

Didn't sign up for MixWise? You can safely ignore this email.

---
This email was sent to ${userEmail}
© ${new Date().getFullYear()} MixWise · A smarter way to make cocktails at home
https://www.getmixwise.com
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
  const subject = "Reset Your MixWise Password";

  const html = `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no">
  <title>Reset Your MixWise Password</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  ${baseStyles}
</head>
<body>
  <div class="email-wrapper">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" class="email-container" style="max-width: 560px; margin: 0 auto; background-color: #FFFFFF; border-radius: 24px; overflow: hidden; box-shadow: 0 8px 30px -8px rgba(0, 0, 0, 0.1); border: 1px solid #E6EBE4;">
      
      <!-- Header -->
      <tr>
        <td class="email-header" style="background: linear-gradient(135deg, #3A4D39 0%, #5F6F5E 100%); padding: 48px 40px; text-align: center;">
          <h1 class="logo" style="font-family: 'DM Serif Display', Georgia, 'Times New Roman', serif; font-size: 36px; font-weight: 700; color: #FFFFFF; margin: 0; letter-spacing: -0.5px;">
            mixwise<span class="logo-dot" style="color: #BC5A45;">.</span>
          </h1>
        </td>
      </tr>
      
      <!-- Content -->
      <tr>
        <td class="email-content" style="padding: 48px 40px;">
          <div class="cocktail-icon" style="text-align: center; font-size: 48px; margin-bottom: 24px;">🔐</div>
          
          <h2 class="greeting" style="font-family: Georgia, 'Times New Roman', serif; font-size: 24px; color: #3A4D39; margin: 0 0 24px 0; font-weight: 400; text-align: center;">
            Reset Your Password
          </h2>
          
          <p class="body-text" style="font-size: 16px; color: #2C3628; margin: 0 0 20px 0; line-height: 1.65;">
            We received a request to reset your password for your MixWise account. If you made this request, click the button below to set a new password.
          </p>
          
          <div class="security-notice" style="background-color: #FEF3E7; border: 1px solid #F5D5BC; border-radius: 12px; padding: 16px 20px; margin: 24px 0;">
            <p style="margin: 0; font-size: 14px; color: #8B3A28;">
              ⏰ <strong>This link expires in 1 hour</strong> for your security.
            </p>
          </div>
          
          <div class="button-wrapper" style="text-align: center; margin: 32px 0;">
            <a href="${resetUrl}" class="btn-warning" style="display: inline-block; background: linear-gradient(135deg, #3A4D39 0%, #2C3628 100%); color: #FFFFFF; text-decoration: none; padding: 18px 40px; border-radius: 50px; font-weight: 600; font-size: 16px; box-shadow: 0 10px 25px -5px rgba(58, 77, 57, 0.3);">
              Reset Your Password
            </a>
          </div>
          
          <div class="divider" style="height: 1px; background: linear-gradient(90deg, transparent, #D1DAD0, transparent); margin: 32px 0;"></div>
          
          <div class="fallback-box" style="background-color: #E6EBE4; border-radius: 12px; padding: 16px 20px; margin: 24px 0; border: 1px solid #D1DAD0;">
            <p class="fallback-label" style="font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #5F6F5E; margin: 0 0 8px 0;">
              Or copy this link:
            </p>
            <p class="fallback-link" style="word-break: break-all; font-family: monospace; font-size: 13px; color: #BC5A45; margin: 0; line-height: 1.5;">
              ${resetUrl}
            </p>
          </div>
          
          <div class="info-box" style="background-color: #F9F7F2; border-radius: 12px; padding: 20px; margin: 24px 0; border-left: 4px solid #8A9A5B;">
            <p style="margin: 0; font-size: 14px; color: #3A4D39;">
              <strong>Didn't request this?</strong> You can safely ignore this email and your password will remain unchanged.
            </p>
          </div>
        </td>
      </tr>
      
      <!-- Footer -->
      <tr>
        <td class="email-footer" style="background-color: #E6EBE4; padding: 32px 40px; text-align: center; border-top: 1px solid #D1DAD0;">
          <p class="footer-text" style="font-size: 13px; color: #5F6F5E; margin: 0 0 12px 0;">
            This email was sent to <strong>${userEmail}</strong>
          </p>
          <p class="footer-text" style="font-size: 13px; color: #5F6F5E; margin: 0;">
            © ${new Date().getFullYear()} MixWise · A smarter way to make cocktails at home
          </p>
          <div class="footer-links" style="margin: 16px 0 0 0;">
            <a href="https://www.getmixwise.com" class="footer-link" style="color: #3A4D39; text-decoration: none; font-size: 13px;">Visit MixWise</a>
          </div>
        </td>
      </tr>
      
    </table>
  </div>
</body>
</html>
  `.trim();

  const text = `
Reset Your MixWise Password 🔐

We received a request to reset your password for your MixWise account.

Click this link to set a new password:
${resetUrl}

⏰ This link expires in 1 hour for your security.

Didn't request this? You can safely ignore this email and your password will remain unchanged.

---
This email was sent to ${userEmail}
© ${new Date().getFullYear()} MixWise · A smarter way to make cocktails at home
https://www.getmixwise.com
  `.trim();

  return { subject, html, text };
}
