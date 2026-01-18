/**
 * Signup Notification Email
 *
 * Shared function to send notification emails to hello@getmixwise.com
 * when a new user signs up. Can be called directly from server-side code.
 */

import { createResendClient, MIXWISE_FROM_EMAIL } from "@/lib/email/resend";

const NOTIFICATION_EMAIL = "hello@getmixwise.com";

/**
 * Escapes HTML special characters
 */
function escapeHtml(text: string): string {
  const map: Record<string, string> = {
    "&": "&amp;",
    "<": "&lt;",
    ">": "&gt;",
    '"': "&quot;",
    "'": "&#039;",
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

export interface SignupNotificationParams {
  userId: string;
  userEmail: string;
  displayName?: string;
  signupMethod?: string;
}

/**
 * Sends a notification email to hello@getmixwise.com when a new user signs up.
 * Returns { success: true } if sent, { success: false, skipped: true } if skipped,
 * or { success: false, error: string } if failed.
 */
export async function sendSignupNotification(
  params: SignupNotificationParams
): Promise<{ success: boolean; skipped?: boolean; error?: string }> {
  try {
    const { userId, userEmail, displayName, signupMethod = "Unknown" } = params;

    // Validate required fields
    if (!userId || typeof userId !== "string") {
      return { success: false, error: "User ID is required" };
    }

    if (!userEmail || typeof userEmail !== "string") {
      return { success: false, error: "User email is required" };
    }

    const trimmedEmail = userEmail.trim().toLowerCase();
    const trimmedName = displayName ? displayName.trim() : "Not provided";

    // Check if Resend is configured
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      console.warn("[Signup Notification] RESEND_API_KEY not set - skipping notification email");
      return { success: false, skipped: true };
    }

    // Create Resend client
    let resend;
    try {
      resend = createResendClient();
    } catch (resendError) {
      console.error("[Signup Notification] Failed to create Resend client:", resendError);
      return { success: false, error: "Email service unavailable" };
    }

    // Format email content
    const emailSubject = `New User Signup: ${trimmedEmail}`;
    
    const emailHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #2C3628;
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
              background-color: #F9F7F2;
            }
            .container {
              background-color: #FFFFFF;
              border-radius: 12px;
              padding: 32px;
              border: 1px solid #E6EBE4;
            }
            .header {
              border-bottom: 2px solid #BC5A45;
              padding-bottom: 16px;
              margin-bottom: 24px;
            }
            h1 {
              color: #3A4D39;
              font-size: 24px;
              margin: 0;
            }
            .field {
              margin-bottom: 20px;
            }
            .field-label {
              font-weight: 600;
              color: #5F6F5E;
              font-size: 12px;
              text-transform: uppercase;
              letter-spacing: 0.5px;
              margin-bottom: 4px;
            }
            .field-value {
              color: #2C3628;
              font-size: 16px;
            }
            .footer {
              margin-top: 32px;
              padding-top: 16px;
              border-top: 1px solid #E6EBE4;
              font-size: 12px;
              color: #5F6F5E;
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <h1>New User Signup</h1>
            </div>
            
            <div class="field">
              <div class="field-label">Email</div>
              <div class="field-value">${escapeHtml(trimmedEmail)}</div>
            </div>
            
            <div class="field">
              <div class="field-label">Name</div>
              <div class="field-value">${escapeHtml(trimmedName)}</div>
            </div>
            
            <div class="field">
              <div class="field-label">User ID</div>
              <div class="field-value">${escapeHtml(userId)}</div>
            </div>
            
            <div class="field">
              <div class="field-label">Signup Method</div>
              <div class="field-value">${escapeHtml(signupMethod)}</div>
            </div>
            
            <div class="footer">
              <p>This is an automated notification from MixWise.</p>
              <p>User account created at ${new Date().toLocaleString()}</p>
            </div>
          </div>
        </body>
      </html>
    `.trim();

    const emailText = `
New User Signup

Email: ${trimmedEmail}
Name: ${trimmedName}
User ID: ${userId}
Signup Method: ${signupMethod}

User account created at ${new Date().toLocaleString()}

This is an automated notification from MixWise.
    `.trim();

    // Send email via Resend
    console.log(`[Signup Notification] Sending notification email to: ${NOTIFICATION_EMAIL}`);

    const { data: emailData, error: emailError } = await resend.emails.send({
      from: MIXWISE_FROM_EMAIL,
      to: NOTIFICATION_EMAIL,
      subject: emailSubject,
      html: emailHtml,
      text: emailText,
      headers: {
        "X-Entity-Ref-ID": `signup-notification-${userId}`,
      },
      tags: [
        { name: "category", value: "signup_notification" },
        { name: "environment", value: process.env.NODE_ENV || "production" },
        { name: "signup_method", value: signupMethod.toLowerCase().replace(/\s+/g, "_") },
      ],
    });

    if (emailError) {
      console.error("[Signup Notification] Failed to send email:", emailError);
      return { success: false, error: "Failed to send notification email" };
    }

    console.log(`[Signup Notification] Notification email sent successfully. Resend ID: ${emailData?.id}`);

    return { success: true };

  } catch (error) {
    console.error("[Signup Notification] Unexpected error:", error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : "Internal server error" 
    };
  }
}
