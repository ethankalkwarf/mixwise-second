/**
 * Contact Form API Route
 *
 * Handles contact form submissions and sends emails via Resend.
 */

import { NextRequest, NextResponse } from "next/server";
import { createResendClient, MIXWISE_FROM_EMAIL } from "@/lib/email/resend";

// Rate limiting: simple in-memory store (resets on server restart)
const rateLimit = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT_WINDOW = 60 * 1000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 3; // 3 requests per minute per IP

/**
 * Checks if an IP address is rate limited
 */
function isRateLimited(ip: string): boolean {
  const now = Date.now();
  const limit = rateLimit.get(ip);

  if (!limit || now > limit.resetTime) {
    rateLimit.set(ip, { count: 1, resetTime: now + RATE_LIMIT_WINDOW });
    return false;
  }

  if (limit.count >= RATE_LIMIT_MAX_REQUESTS) {
    return true;
  }

  limit.count++;
  return false;
}

/**
 * Validates email format
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

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

const CONTACT_EMAIL = "hello@getmixwise.com";

export async function POST(request: NextRequest) {
  try {
    // Get client IP for rate limiting
    const clientIP = request.headers.get("x-forwarded-for") ||
                     request.headers.get("x-real-ip") ||
                     "unknown";

    // Rate limiting check
    if (isRateLimited(clientIP)) {
      console.warn(`[Contact Form] Rate limit exceeded for IP: ${clientIP}`);
      return NextResponse.json(
        { error: "Too many requests. Please try again later." },
        { status: 429 }
      );
    }

    // Parse request body
    const body = await request.json();
    const { name, email, subject, message } = body;

    // Validate required fields
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }

    if (!email || typeof email !== "string" || !email.trim()) {
      return NextResponse.json(
        { error: "Email is required" },
        { status: 400 }
      );
    }

    if (!message || typeof message !== "string" || !message.trim()) {
      return NextResponse.json(
        { error: "Message is required" },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedName = name.trim();
    const trimmedSubject = subject?.trim() || "Contact Form Submission";
    const trimmedMessage = message.trim();

    if (!isValidEmail(trimmedEmail)) {
      return NextResponse.json(
        { error: "Invalid email format" },
        { status: 400 }
      );
    }

    // Validate message length (reasonable limit)
    if (trimmedMessage.length > 5000) {
      return NextResponse.json(
        { error: "Message is too long. Please keep it under 5000 characters." },
        { status: 400 }
      );
    }

    console.log(`[Contact Form] Processing submission from: ${trimmedName} (${trimmedEmail}), IP: ${clientIP}`);

    // Create Resend client
    const resend = createResendClient();

    // Format email content
    const emailSubject = `Contact Form: ${trimmedSubject}`;
    
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
            .message-content {
              background-color: #F9F7F2;
              padding: 16px;
              border-radius: 8px;
              border-left: 4px solid #BC5A45;
              white-space: pre-wrap;
              word-wrap: break-word;
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
              <h1>New Contact Form Submission</h1>
            </div>
            
            <div class="field">
              <div class="field-label">From</div>
              <div class="field-value">${escapeHtml(trimmedName)} &lt;${escapeHtml(trimmedEmail)}&gt;</div>
            </div>
            
            <div class="field">
              <div class="field-label">Subject</div>
              <div class="field-value">${escapeHtml(trimmedSubject)}</div>
            </div>
            
            <div class="field">
              <div class="field-label">Message</div>
              <div class="message-content">${escapeHtml(trimmedMessage).replace(/\n/g, "<br>")}</div>
            </div>
            
            <div class="footer">
              <p>This message was sent from the MixWise contact form.</p>
              <p>You can reply directly to this email to respond to ${trimmedName}.</p>
            </div>
          </div>
        </body>
      </html>
    `.trim();

    const emailText = `
New Contact Form Submission

From: ${trimmedName} <${trimmedEmail}>
Subject: ${trimmedSubject}

Message:
${trimmedMessage}

---
This message was sent from the MixWise contact form.
You can reply directly to this email to respond to ${trimmedName}.
    `.trim();

    // Send email via Resend
    console.log(`[Contact Form] Sending email to: ${CONTACT_EMAIL}`);

    const { data: emailData, error: emailError } = await resend.emails.send({
      from: MIXWISE_FROM_EMAIL,
      to: CONTACT_EMAIL,
      replyTo: trimmedEmail,
      subject: emailSubject,
      html: emailHtml,
      text: emailText,
      headers: {
        "X-Entity-Ref-ID": `contact-${Date.now()}`,
      },
      tags: [
        { name: "category", value: "contact_form" },
        { name: "environment", value: process.env.NODE_ENV || "production" },
      ],
    });

    if (emailError) {
      console.error("[Contact Form] Failed to send email:", emailError);
      return NextResponse.json(
        { error: "Failed to send message. Please try again later." },
        { status: 500 }
      );
    }

    console.log(`[Contact Form] Email sent successfully. Resend ID: ${emailData?.id}`);

    return NextResponse.json({
      ok: true,
      message: "Your message has been sent successfully. We'll get back to you soon!",
    });

  } catch (error) {
    console.error("[Contact Form] Unexpected error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
