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

/**
 * Generate hidden preheader text for email preview
 * This text appears after the subject line in email clients
 */
function getPreheaderHtml(previewText: string): string {
  // The whitespace characters prevent email clients from showing body content after the preview
  const whitespace = '&nbsp;'.repeat(100) + '&zwnj;'.repeat(50);
  
  return `
    <!--[if !mso]><!-->
    <div style="display:none;font-size:1px;color:#F9F7F2;line-height:1px;max-height:0px;max-width:0px;opacity:0;overflow:hidden;">
      ${previewText}${whitespace}
    </div>
    <!--<![endif]-->
  `;
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
      color: #FFFFFF;
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
  const previewText = "One click to unlock hundreds of cocktail recipes you can make at home. Let's get mixing!";

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
  ${getPreheaderHtml(previewText)}
  <div class="email-wrapper">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" class="email-container" style="max-width: 560px; margin: 0 auto; background-color: #FFFFFF; border-radius: 24px; overflow: hidden; box-shadow: 0 8px 30px -8px rgba(0, 0, 0, 0.1); border: 1px solid #E6EBE4;">
      
      <!-- Header -->
      <tr>
        <td class="email-header" bgcolor="#3A4D39" style="background-color: #3A4D39; background: linear-gradient(135deg, #3A4D39 0%, #5F6F5E 100%); padding: 48px 40px; text-align: center;">
          <h1 class="logo" style="font-family: Georgia, 'Times New Roman', serif; font-size: 36px; font-weight: 700; color: #FFFFFF; margin: 0; letter-spacing: -0.5px;">
            mixwise.
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
            <a href="${confirmUrl}" class="btn-primary" style="display: inline-block; background-color: #BC5A45; background: linear-gradient(135deg, #BC5A45 0%, #A04532 100%); color: #FFFFFF; text-decoration: none; padding: 18px 40px; border-radius: 50px; font-weight: 600; font-size: 16px;">
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
  const previewText = "Click here to securely reset your password and get back to mixing. Link expires in 1 hour.";

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
  ${getPreheaderHtml(previewText)}
  <div class="email-wrapper">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" class="email-container" style="max-width: 560px; margin: 0 auto; background-color: #FFFFFF; border-radius: 24px; overflow: hidden; box-shadow: 0 8px 30px -8px rgba(0, 0, 0, 0.1); border: 1px solid #E6EBE4;">
      
      <!-- Header -->
      <tr>
        <td class="email-header" bgcolor="#3A4D39" style="background-color: #3A4D39; background: linear-gradient(135deg, #3A4D39 0%, #5F6F5E 100%); padding: 48px 40px; text-align: center;">
          <h1 class="logo" style="font-family: Georgia, 'Times New Roman', serif; font-size: 36px; font-weight: 700; color: #FFFFFF; margin: 0; letter-spacing: -0.5px;">
            mixwise.
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
            <a href="${resetUrl}" class="btn-warning" style="display: inline-block; background-color: #3A4D39; background: linear-gradient(135deg, #3A4D39 0%, #2C3628 100%); color: #FFFFFF; text-decoration: none; padding: 18px 40px; border-radius: 50px; font-weight: 600; font-size: 16px;">
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

/**
 * Welcome email template sent after email confirmation
 */
export function welcomeEmailTemplate({
  displayName,
  userEmail,
  unsubscribeUrl,
}: {
  displayName: string;
  userEmail: string;
  unsubscribeUrl: string;
}): EmailTemplate {
  const subject = "Welcome to MixWise! 🍸 Let's make your first cocktail";
  const previewText = `Hey ${displayName}! Your bar is ready. Add your ingredients and discover what cocktails you can make tonight.`;

  const html = `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no">
  <title>Welcome to MixWise!</title>
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
  ${getPreheaderHtml(previewText)}
  <div class="email-wrapper">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" class="email-container" style="max-width: 560px; margin: 0 auto; background-color: #FFFFFF; border-radius: 24px; overflow: hidden; box-shadow: 0 8px 30px -8px rgba(0, 0, 0, 0.1); border: 1px solid #E6EBE4;">
      
      <!-- Header -->
      <tr>
        <td class="email-header" bgcolor="#3A4D39" style="background-color: #3A4D39; background: linear-gradient(135deg, #3A4D39 0%, #5F6F5E 100%); padding: 48px 40px; text-align: center;">
          <h1 class="logo" style="font-family: Georgia, 'Times New Roman', serif; font-size: 36px; font-weight: 700; color: #FFFFFF; margin: 0; letter-spacing: -0.5px;">
            mixwise.
          </h1>
        </td>
      </tr>
      
      <!-- Content -->
      <tr>
        <td class="email-content" style="padding: 48px 40px;">
          <div style="text-align: center; font-size: 48px; margin-bottom: 24px;">🎉</div>
          
          <h2 class="greeting" style="font-family: Georgia, 'Times New Roman', serif; font-size: 24px; color: #3A4D39; margin: 0 0 24px 0; font-weight: 400; text-align: center;">
            Welcome, ${displayName}!
          </h2>
          
          <p class="body-text" style="font-size: 16px; color: #2C3628; margin: 0 0 20px 0; line-height: 1.65;">
            Your account is all set up and ready to go. You've just joined a community of cocktail enthusiasts who are discovering new drinks, perfecting classic recipes, and building their home bars.
          </p>
          
          <p class="body-text" style="font-size: 16px; color: #2C3628; margin: 0 0 24px 0; line-height: 1.65;">
            Here's what you can do with your MixWise account:
          </p>
          
          <!-- Feature Cards -->
          <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin-bottom: 24px;">
            <tr>
              <td style="padding: 16px; background-color: #F9F7F2; border-radius: 16px; margin-bottom: 12px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                  <tr>
                    <td style="width: 48px; vertical-align: top;">
                      <span style="font-size: 32px;">🍸</span>
                    </td>
                    <td style="padding-left: 12px;">
                      <p style="margin: 0 0 4px 0; font-weight: 600; color: #3A4D39; font-size: 16px;">Build Your Bar</p>
                      <p style="margin: 0; color: #5F6F5E; font-size: 14px; line-height: 1.5;">Add the ingredients you have at home and see what cocktails you can make right now.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr><td style="height: 12px;"></td></tr>
            <tr>
              <td style="padding: 16px; background-color: #F9F7F2; border-radius: 16px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                  <tr>
                    <td style="width: 48px; vertical-align: top;">
                      <span style="font-size: 32px;">❤️</span>
                    </td>
                    <td style="padding-left: 12px;">
                      <p style="margin: 0 0 4px 0; font-weight: 600; color: #3A4D39; font-size: 16px;">Save Your Favorites</p>
                      <p style="margin: 0; color: #5F6F5E; font-size: 14px; line-height: 1.5;">Heart the recipes you love and access them anytime from your dashboard.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
            <tr><td style="height: 12px;"></td></tr>
            <tr>
              <td style="padding: 16px; background-color: #F9F7F2; border-radius: 16px;">
                <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
                  <tr>
                    <td style="width: 48px; vertical-align: top;">
                      <span style="font-size: 32px;">✨</span>
                    </td>
                    <td style="padding-left: 12px;">
                      <p style="margin: 0 0 4px 0; font-weight: 600; color: #3A4D39; font-size: 16px;">Daily Inspiration</p>
                      <p style="margin: 0; color: #5F6F5E; font-size: 14px; line-height: 1.5;">Check out our Cocktail of the Day for fresh inspiration and expand your mixing repertoire.</p>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>
          </table>
          
          <div class="button-wrapper" style="text-align: center; margin: 32px 0;">
            <a href="https://www.getmixwise.com/mix" class="btn-primary" style="display: inline-block; background-color: #BC5A45; background: linear-gradient(135deg, #BC5A45 0%, #A04532 100%); color: #FFFFFF; text-decoration: none; padding: 18px 40px; border-radius: 50px; font-weight: 600; font-size: 16px;">
              Start Mixing →
            </a>
          </div>
          
          <div class="divider" style="height: 1px; background: linear-gradient(90deg, transparent, #D1DAD0, transparent); margin: 32px 0;"></div>
          
          <p class="muted-text" style="font-size: 14px; color: #5F6F5E; margin: 0; line-height: 1.6; text-align: center;">
            Have questions? Just reply to this email – we'd love to hear from you!
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
            <a href="https://www.getmixwise.com" style="color: #3A4D39; text-decoration: none; font-size: 13px; margin: 0 8px;">Visit MixWise</a>
            <span style="color: #D1DAD0;">|</span>
            <a href="${unsubscribeUrl}" style="color: #5F6F5E; text-decoration: none; font-size: 13px; margin: 0 8px;">Unsubscribe</a>
          </div>
        </td>
      </tr>
      
    </table>
  </div>
</body>
</html>
  `.trim();

  const text = `
Welcome to MixWise, ${displayName}! 🎉

Your account is all set up and ready to go. You've just joined a community of cocktail enthusiasts who are discovering new drinks, perfecting classic recipes, and building their home bars.

Here's what you can do:

🍸 BUILD YOUR BAR
Add the ingredients you have at home and see what cocktails you can make right now.

❤️ SAVE YOUR FAVORITES  
Heart the recipes you love and access them anytime from your dashboard.

✨ DAILY INSPIRATION
Check out our Cocktail of the Day for fresh inspiration and expand your mixing repertoire.

Get started: https://www.getmixwise.com/mix

Have questions? Just reply to this email – we'd love to hear from you!

---
This email was sent to ${userEmail}
© ${new Date().getFullYear()} MixWise · A smarter way to make cocktails at home
https://www.getmixwise.com

Unsubscribe: ${unsubscribeUrl}
  `.trim();

  return { subject, html, text };
}

/**
 * Weekly digest email template
 * Sent every Sunday with personalized cocktail recommendations
 */
export function weeklyDigestTemplate({
  displayName,
  userEmail,
  unsubscribeUrl,
  cocktailsYouCanMake,
  featuredCocktail,
  barIngredientCount,
}: {
  displayName: string;
  userEmail: string;
  unsubscribeUrl: string;
  cocktailsYouCanMake: Array<{ name: string; slug: string; imageUrl?: string }>;
  featuredCocktail?: { name: string; slug: string; description?: string; imageUrl?: string };
  barIngredientCount: number;
}): EmailTemplate {
  const subject = `🍸 Your Weekly MixWise Digest – ${cocktailsYouCanMake.length} cocktails waiting for you`;
  
  // Dynamic preview text based on content
  const previewText = cocktailsYouCanMake.length > 0
    ? `You can make ${cocktailsYouCanMake[0].name}${cocktailsYouCanMake.length > 1 ? `, ${cocktailsYouCanMake[1].name}` : ''} and more with what's in your bar!`
    : featuredCocktail 
      ? `This week's featured cocktail: ${featuredCocktail.name}. Plus tips to build your home bar.`
      : "Discover new cocktails and build your home bar this week!";

  // Generate cocktail cards HTML
  const cocktailCardsHtml = cocktailsYouCanMake.slice(0, 3).map(cocktail => `
    <tr>
      <td style="padding: 12px 16px; background-color: #F9F7F2; border-radius: 12px; margin-bottom: 8px;">
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
          <tr>
            <td style="vertical-align: middle;">
              <a href="https://www.getmixwise.com/cocktails/${cocktail.slug}" style="color: #3A4D39; text-decoration: none; font-weight: 600; font-size: 16px;">${cocktail.name}</a>
              <p style="margin: 4px 0 0 0; font-size: 13px; color: #5F6F5E;">You have all the ingredients!</p>
            </td>
            <td style="width: 80px; text-align: right;">
              <a href="https://www.getmixwise.com/cocktails/${cocktail.slug}" style="display: inline-block; background-color: #BC5A45; color: #FFFFFF; text-decoration: none; padding: 8px 16px; border-radius: 20px; font-size: 13px; font-weight: 600;">Make it</a>
            </td>
          </tr>
        </table>
      </td>
    </tr>
    <tr><td style="height: 8px;"></td></tr>
  `).join('');

  const featuredSection = featuredCocktail ? `
    <!--[if mso]>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin: 24px 0;">
      <tr>
        <td bgcolor="#3A4D39" style="padding: 0;">
    <![endif]-->
    <div style="background-color: #3A4D39; background: linear-gradient(135deg, #3A4D39 0%, #5F6F5E 100%); border-radius: 16px; overflow: hidden; margin: 24px 0;">
      ${featuredCocktail.imageUrl ? `
      <div style="width: 100%; height: 200px; overflow: hidden;">
        <img src="${featuredCocktail.imageUrl}" alt="${featuredCocktail.name}" width="560" height="200" style="width: 100%; height: 200px; object-fit: cover; display: block;" />
      </div>
      ` : ''}
      <div style="background-color: #3A4D39; padding: 24px; text-align: center;">
        <p style="margin: 0 0 8px 0; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #8A9A5B;">✨ Featured This Week</p>
        <h3 style="margin: 0 0 12px 0; font-family: Georgia, serif; font-size: 28px; color: #FFFFFF;">${featuredCocktail.name}</h3>
        ${featuredCocktail.description ? `<p style="margin: 0 0 16px 0; font-size: 14px; color: #E6EBE4; line-height: 1.5;">${featuredCocktail.description}</p>` : ''}
        <a href="https://www.getmixwise.com/cocktails/${featuredCocktail.slug}" style="display: inline-block; background-color: #BC5A45; color: #FFFFFF; text-decoration: none; padding: 12px 24px; border-radius: 25px; font-size: 14px; font-weight: 600;">View Recipe →</a>
      </div>
    </div>
    <!--[if mso]>
        </td>
      </tr>
    </table>
    <![endif]-->
  ` : '';

  const html = `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="format-detection" content="telephone=no,address=no,email=no,date=no,url=no">
  <title>Your Weekly MixWise Digest</title>
  ${baseStyles}
</head>
<body>
  ${getPreheaderHtml(previewText)}
  <div class="email-wrapper">
    <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" class="email-container" style="max-width: 560px; margin: 0 auto; background-color: #FFFFFF; border-radius: 24px; overflow: hidden; box-shadow: 0 8px 30px -8px rgba(0, 0, 0, 0.1); border: 1px solid #E6EBE4;">
      
      <!-- Header -->
      <tr>
        <td class="email-header" bgcolor="#3A4D39" style="background-color: #3A4D39; background: linear-gradient(135deg, #3A4D39 0%, #5F6F5E 100%); padding: 48px 40px; text-align: center;">
          <h1 class="logo" style="font-family: Georgia, 'Times New Roman', serif; font-size: 36px; font-weight: 700; color: #FFFFFF; margin: 0; letter-spacing: -0.5px;">
            mixwise.
          </h1>
        </td>
      </tr>
      
      <!-- Content -->
      <tr>
        <td class="email-content" style="padding: 48px 40px;">
          <h2 style="font-family: Georgia, 'Times New Roman', serif; font-size: 24px; color: #3A4D39; margin: 0 0 8px 0; font-weight: 400;">
            Happy Sunday, ${displayName}! 🌿
          </h2>
          
          <p class="body-text" style="font-size: 16px; color: #2C3628; margin: 0 0 24px 0; line-height: 1.65;">
            Here's your weekly cocktail inspiration based on your bar with <strong>${barIngredientCount} ingredients</strong>.
          </p>
          
          ${cocktailsYouCanMake.length > 0 ? `
          <!-- Cocktails You Can Make -->
          <div style="margin-bottom: 32px;">
            <h3 style="font-size: 14px; font-weight: 600; text-transform: uppercase; letter-spacing: 1px; color: #5F6F5E; margin: 0 0 16px 0;">
              🍸 Ready to Make (${cocktailsYouCanMake.length} total)
            </h3>
            <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%">
              ${cocktailCardsHtml}
            </table>
            ${cocktailsYouCanMake.length > 3 ? `
            <p style="text-align: center; margin: 16px 0 0 0;">
              <a href="https://www.getmixwise.com/mix" style="color: #BC5A45; font-weight: 600; text-decoration: none;">See all ${cocktailsYouCanMake.length} cocktails →</a>
            </p>
            ` : ''}
          </div>
          ` : `
          <!-- Build Your Bar CTA for users with no ingredients -->
          <div style="background-color: #F9F7F2; background: linear-gradient(135deg, #F9F7F2 0%, #E6EBE4 100%); border-radius: 16px; padding: 32px 24px; margin-bottom: 24px; text-align: center; border: 1px solid #D1DAD0;">
            <p style="margin: 0 0 16px 0; font-size: 40px;">🍾</p>
            <h3 style="margin: 0 0 12px 0; font-family: 'DM Serif Display', Georgia, serif; font-size: 22px; color: #3A4D39;">Ready to discover what you can make?</h3>
            <p style="margin: 0 0 20px 0; font-size: 15px; color: #5F6F5E; line-height: 1.6;">Tell us what's in your bar and we'll show you all the cocktails you can make right now — no shopping required!</p>
            <a href="https://www.getmixwise.com/mix" style="display: inline-block; background-color: #BC5A45; color: #FFFFFF; text-decoration: none; padding: 14px 28px; border-radius: 25px; font-size: 15px; font-weight: 600;">Build My Bar →</a>
          </div>
          `}
          
          ${featuredSection}
          
          <div class="divider" style="height: 1px; background: linear-gradient(90deg, transparent, #D1DAD0, transparent); margin: 32px 0;"></div>
          
          <p class="muted-text" style="font-size: 14px; color: #5F6F5E; margin: 0; line-height: 1.6; text-align: center;">
            Cheers to a great week ahead! 🥂
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
            <a href="https://www.getmixwise.com" style="color: #3A4D39; text-decoration: none; font-size: 13px; margin: 0 8px;">Visit MixWise</a>
            <span style="color: #D1DAD0;">|</span>
            <a href="${unsubscribeUrl}" style="color: #5F6F5E; text-decoration: none; font-size: 13px; margin: 0 8px;">Unsubscribe</a>
          </div>
        </td>
      </tr>
      
    </table>
  </div>
</body>
</html>
  `.trim();

  const cocktailListText = cocktailsYouCanMake.slice(0, 5).map(c => 
    `  • ${c.name}: https://www.getmixwise.com/cocktails/${c.slug}`
  ).join('\n');

  const text = `
Your Weekly MixWise Digest 🍸

Happy Sunday, ${displayName}!

Here's your weekly cocktail inspiration based on your bar with ${barIngredientCount} ingredients.

${cocktailsYouCanMake.length > 0 ? `
READY TO MAKE (${cocktailsYouCanMake.length} total):
${cocktailListText}

See all cocktails: https://www.getmixwise.com/mix
` : `
BUILD YOUR BAR
Add ingredients to your bar to see personalized cocktail recommendations.
https://www.getmixwise.com/mix
`}
${featuredCocktail ? `
FEATURED THIS WEEK: ${featuredCocktail.name}
${featuredCocktail.description || ''}
https://www.getmixwise.com/cocktails/${featuredCocktail.slug}
` : ''}

Cheers to a great week ahead! 🥂

---
This email was sent to ${userEmail}
© ${new Date().getFullYear()} MixWise · A smarter way to make cocktails at home
https://www.getmixwise.com

Unsubscribe: ${unsubscribeUrl}
  `.trim();

  return { subject, html, text };
}

/**
 * Wedding Cocktail Recommendations Email Template
 * Sent when users complete the wedding cocktail finder quiz
 */
export function weddingRecommendationsTemplate({
  recommendations,
}: {
  recommendations: Array<{
    name: string;
    slug: string;
    base_spirit: string | null;
  }>;
}): EmailTemplate {
  const subject = `Your ${recommendations.length} Wedding Cocktail Recommendations`;

  // Build recommendations list HTML
  const recommendationsList = recommendations
    .map((rec, index) => {
      const spirit = rec.base_spirit ? ` • ${rec.base_spirit}` : "";
      return `
        <tr>
          <td style="padding: 12px 0; border-bottom: 1px solid #E6EBE4;">
            <strong style="color: #3A4D39; font-size: 18px;">${index + 1}. ${rec.name}</strong>
            ${spirit ? `<span style="color: #5F6F5E; font-size: 14px;">${spirit}</span>` : ""}
            <br>
            <a href="https://getmixwise.com/cocktails/${rec.slug}" style="color: #BC5A45; text-decoration: none; font-size: 14px;">View Recipe →</a>
          </td>
        </tr>
      `;
    })
    .join("");

  const html = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        ${baseStyles}
      </head>
      <body>
        ${getPreheaderHtml(`Your ${recommendations.length} personalized wedding cocktail recommendations`)}
        <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="background-color: #F9F7F2; padding: 20px;">
          <tr>
            <td align="center">
              <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="600" style="background-color: #FFFFFF; border-radius: 12px; overflow: hidden; border: 1px solid #E6EBE4;">
                <!-- Header -->
                <tr>
                  <td style="background-color: #FFFFFF; padding: 40px 40px 24px 40px; border-bottom: 2px solid #BC5A45;">
                    <h1 style="margin: 0; font-family: 'DM Serif Display', Georgia, serif; font-size: 28px; color: #3A4D39; line-height: 1.3;">
                      Your Wedding Cocktail Recommendations
                    </h1>
                  </td>
                </tr>
                
                <!-- Content -->
                <tr>
                  <td style="padding: 32px 40px;">
                    <p style="margin: 0 0 24px 0; font-size: 16px; color: #2C3628; line-height: 1.6;">
                      Thank you for using our wedding cocktail finder! Here are your <strong>${recommendations.length}</strong> personalized cocktail recommendations based on your preferences.
                    </p>

                    <table role="presentation" cellspacing="0" cellpadding="0" border="0" width="100%" style="margin: 24px 0;">
                      ${recommendationsList}
                    </table>

                    <div style="text-align: center; margin: 32px 0;">
                      <a href="https://getmixwise.com/wedding-menu" style="display: inline-block; background-color: #BC5A45; color: #F9F7F2; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: bold; font-size: 16px;">
                        View All Recommendations
                      </a>
                    </div>
                  </td>
                </tr>
                
                <!-- Footer -->
                <tr>
                  <td style="background-color: #E6EBE4; padding: 24px 40px; text-align: center; border-top: 1px solid #D1DAD0;">
                    <p style="margin: 0 0 12px 0; font-size: 13px; color: #5F6F5E;">
                      This email was sent from MixWise. You can view and save your recommendations anytime by visiting your account.
                    </p>
                    <p style="margin: 0; font-size: 13px; color: #5F6F5E;">
                      Questions? Reply to this email or visit <a href="https://getmixwise.com/contact" style="color: #BC5A45; text-decoration: none;">getmixwise.com/contact</a>
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
        </table>
      </body>
    </html>
  `.trim();

  const text = `
Your Wedding Cocktail Recommendations

Thank you for using our wedding cocktail finder! Here are your ${recommendations.length} personalized cocktail recommendations:

${recommendations.map((rec, index) => 
  `${index + 1}. ${rec.name}${rec.base_spirit ? ` • ${rec.base_spirit}` : ""}\n   View: https://getmixwise.com/cocktails/${rec.slug}`
).join("\n\n")}

View all recommendations: https://getmixwise.com/wedding-menu

---
This email was sent from MixWise.
Questions? Visit https://getmixwise.com/contact
  `.trim();

  return { subject, html, text };
}
