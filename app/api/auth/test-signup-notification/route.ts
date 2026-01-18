/**
 * Test Signup Notification API Route
 *
 * Sends a test notification email to hello@getmixwise.com.
 * This is for testing purposes only.
 */

import { NextRequest, NextResponse } from "next/server";
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

export async function GET(request: NextRequest) {
  try {
    // Check if Resend is configured
    const resendApiKey = process.env.RESEND_API_KEY;
    if (!resendApiKey) {
      return NextResponse.json(
        { error: "RESEND_API_KEY not configured" },
        { status: 500 }
      );
    }

    // Create Resend client
    let resend;
    try {
      resend = createResendClient();
    } catch (resendError) {
      console.error("[Test Signup Notification] Failed to create Resend client:", resendError);
      return NextResponse.json(
        { error: "Email service unavailable" },
        { status: 500 }
      );
    }

    // Test data
    const testUserId = "test-user-" + Date.now();
    const testEmail = "test@example.com";
    const testName = "Test User";
    const testSignupMethod = "Test";

    // Format email content
    const emailSubject = `[TEST] New User Signup: ${testEmail}`;
    
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
            .test-banner {
              background-color: #FFF3CD;
              border: 1px solid #FFC107;
              border-radius: 8px;
              padding: 12px;
              margin-bottom: 24px;
              text-align: center;
              font-weight: 600;
              color: #856404;
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
            <div class="test-banner">
              🧪 THIS IS A TEST EMAIL
            </div>
            <div class="header">
              <h1>New User Signup</h1>
            </div>
            
            <div class="field">
              <div class="field-label">Email</div>
              <div class="field-value">${escapeHtml(testEmail)}</div>
            </div>
            
            <div class="field">
              <div class="field-label">Name</div>
              <div class="field-value">${escapeHtml(testName)}</div>
            </div>
            
            <div class="field">
              <div class="field-label">User ID</div>
              <div class="field-value">${escapeHtml(testUserId)}</div>
            </div>
            
            <div class="field">
              <div class="field-label">Signup Method</div>
              <div class="field-value">${escapeHtml(testSignupMethod)}</div>
            </div>
            
            <div class="footer">
              <p>This is a TEST notification from MixWise.</p>
              <p>Test sent at ${new Date().toLocaleString()}</p>
            </div>
          </div>
        </body>
      </html>
    `.trim();

    const emailText = `
[TEST] New User Signup

Email: ${testEmail}
Name: ${testName}
User ID: ${testUserId}
Signup Method: ${testSignupMethod}

Test sent at ${new Date().toLocaleString()}

This is a TEST notification from MixWise.
    `.trim();

    // Send email via Resend
    console.log(`[Test Signup Notification] Sending test notification email to: ${NOTIFICATION_EMAIL}`);

    const { data: emailData, error: emailError } = await resend.emails.send({
      from: MIXWISE_FROM_EMAIL,
      to: NOTIFICATION_EMAIL,
      subject: emailSubject,
      html: emailHtml,
      text: emailText,
      headers: {
        "X-Entity-Ref-ID": `test-signup-notification-${testUserId}`,
      },
      tags: [
        { name: "category", value: "signup_notification" },
        { name: "environment", value: process.env.NODE_ENV || "production" },
        { name: "test", value: "true" },
      ],
    });

    if (emailError) {
      console.error("[Test Signup Notification] Failed to send email:", emailError);
      return NextResponse.json(
        { error: "Failed to send test notification email", details: emailError },
        { status: 500 }
      );
    }

    console.log(`[Test Signup Notification] Test notification email sent successfully. Resend ID: ${emailData?.id}`);

    return NextResponse.json({ 
      ok: true, 
      message: "Test notification email sent successfully",
      resendId: emailData?.id,
      sentTo: NOTIFICATION_EMAIL,
    });

  } catch (error) {
    console.error("[Test Signup Notification] Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    );
  }
}

