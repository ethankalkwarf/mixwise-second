/**
 * Email Preview API Route
 * 
 * Renders email templates as standalone HTML pages for preview.
 * Access at: /api/email-preview?template=confirmation or /api/email-preview?template=password-reset
 * 
 * In production, this should be protected or removed.
 */

import { NextRequest, NextResponse } from "next/server";
import { confirmEmailTemplate, resetPasswordTemplate, welcomeEmailTemplate, weeklyDigestTemplate, weddingRecommendationsTemplate } from "@/lib/email/templates";
import { createAdminClient } from "@/lib/supabase/admin";

// Sample data for preview
const SAMPLE_EMAIL = "user@example.com";
const SAMPLE_DISPLAY_NAME = "Ethan";
const SAMPLE_CONFIRM_URL = "https://www.getmixwise.com/auth/callback?token=sample-token-abc123xyz";
const SAMPLE_RESET_URL = "https://www.getmixwise.com/reset-password?token=sample-token-abc123xyz";
const SAMPLE_UNSUBSCRIBE_URL = "https://www.getmixwise.com/unsubscribe?token=sample-token-abc123xyz";

// Fetch real cocktails from database for preview
async function fetchCocktailsForPreview() {
  try {
    const supabase = createAdminClient();
    
    // Get cocktails with images
    const { data, error } = await supabase
      .from("cocktails")
      .select("name, slug, short_description, image_url")
      .not("image_url", "is", null)
      .limit(10);
    
    if (error) {
      console.error("[Email Preview] Database error:", error);
      return { featured: null, samples: [] };
    }
    
    if (!data || data.length === 0) {
      console.log("[Email Preview] No cocktails with images found");
      return { featured: null, samples: [] };
    }
    
    console.log(`[Email Preview] Found ${data.length} cocktails with images`);
    console.log("[Email Preview] Sample image_url:", data[0]?.image_url);
    
    const featured = {
      name: data[0].name,
      slug: data[0].slug,
      description: data[0].short_description || undefined,
      imageUrl: data[0].image_url || undefined,
    };
    
    const samples = data.slice(0, 5).map(c => ({
      name: c.name,
      slug: c.slug,
      imageUrl: c.image_url || undefined,
    }));
    
    return { featured, samples };
  } catch (err) {
    console.error("[Email Preview] Failed to fetch cocktails:", err);
    return { featured: null, samples: [] };
  }
}

// Fallback data if database fails
const FALLBACK_COCKTAILS = [
  { name: "Margarita", slug: "margarita" },
  { name: "Moscow Mule", slug: "moscow-mule" },
  { name: "Whiskey Sour", slug: "whiskey-sour" },
];
const FALLBACK_FEATURED = {
  name: "Negroni",
  slug: "negroni",
  description: "A perfectly balanced bitter-sweet Italian aperitivo with gin, Campari, and sweet vermouth.",
};
const EMPTY_COCKTAILS: Array<{ name: string; slug: string }> = [];

// Preview page wrapper HTML
function wrapInPreviewPage(templateName: string, emailHtml: string, subject: string): string {
  const templates = [
    { id: "confirmation", name: "Email Confirmation" },
    { id: "welcome", name: "Welcome Email" },
    { id: "weekly-digest", name: "Weekly Digest (with bar)" },
    { id: "weekly-digest-empty", name: "Weekly Digest (no bar)" },
    { id: "password-reset", name: "Password Reset" },
    { id: "wedding-recommendations", name: "Wedding Recommendations" },
  ];

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Email Preview - ${templateName} | MixWise</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    
    body {
      font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      background-color: #F9F7F2;
      color: #2C3628;
      min-height: 100vh;
    }
    
    .header {
      background: linear-gradient(135deg, #3A4D39 0%, #5F6F5E 100%);
      color: white;
      padding: 24px 32px;
    }
    
    .header h1 {
      font-size: 24px;
      margin-bottom: 4px;
    }
    
    .header p {
      opacity: 0.7;
      font-size: 14px;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
      padding: 32px;
      display: grid;
      grid-template-columns: 280px 1fr;
      gap: 32px;
    }
    
    @media (max-width: 900px) {
      .container {
        grid-template-columns: 1fr;
      }
    }
    
    .sidebar {
      background: white;
      border-radius: 16px;
      padding: 24px;
      border: 1px solid #E6EBE4;
      height: fit-content;
      position: sticky;
      top: 32px;
    }
    
    .sidebar h2 {
      font-size: 14px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #5F6F5E;
      margin-bottom: 16px;
    }
    
    .template-list {
      display: flex;
      flex-direction: column;
      gap: 8px;
    }
    
    .template-link {
      display: block;
      padding: 12px 16px;
      border-radius: 12px;
      text-decoration: none;
      color: #2C3628;
      transition: all 0.2s;
    }
    
    .template-link:hover {
      background: #E6EBE4;
    }
    
    .template-link.active {
      background: #BC5A45;
      color: white;
    }
    
    .template-link span {
      font-weight: 500;
      display: block;
    }
    
    .template-link small {
      font-size: 12px;
      opacity: 0.7;
    }
    
    .view-controls {
      margin-top: 24px;
      padding-top: 24px;
      border-top: 1px solid #E6EBE4;
    }
    
    .view-controls h3 {
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 1px;
      color: #5F6F5E;
      margin-bottom: 12px;
    }
    
    .view-buttons {
      display: flex;
      gap: 8px;
    }
    
    .view-btn {
      flex: 1;
      padding: 10px 16px;
      border: 1px solid #E6EBE4;
      border-radius: 8px;
      background: white;
      cursor: pointer;
      font-size: 14px;
      transition: all 0.2s;
    }
    
    .view-btn:hover {
      background: #E6EBE4;
    }
    
    .view-btn.active {
      background: #3A4D39;
      color: white;
      border-color: #3A4D39;
    }
    
    .main {
      background: white;
      border-radius: 16px;
      overflow: hidden;
      border: 1px solid #E6EBE4;
    }
    
    .preview-header {
      background: #E6EBE4;
      padding: 16px 24px;
      border-bottom: 1px solid #D1DAD0;
    }
    
    .preview-header h2 {
      font-size: 16px;
      color: #3A4D39;
      margin-bottom: 4px;
    }
    
    .preview-header p {
      font-size: 14px;
      color: #5F6F5E;
    }
    
    .preview-header .from {
      margin-top: 8px;
      font-size: 13px;
    }
    
    .preview-header .from span {
      color: #3A4D39;
    }
    
    .preview-frame {
      background: #D1DAD0;
      padding: 24px;
      display: flex;
      justify-content: center;
      min-height: 600px;
    }
    
    .preview-frame.mobile {
      justify-content: center;
    }
    
    .preview-frame.mobile iframe {
      width: 375px;
    }
    
    .preview-frame iframe {
      width: 100%;
      max-width: 700px;
      height: 800px;
      border: none;
      border-radius: 8px;
      background: white;
      box-shadow: 0 8px 30px rgba(0,0,0,0.1);
    }
    
    .tips {
      margin-top: 24px;
      padding: 16px;
      background: #E6EBE4;
      border-radius: 12px;
    }
    
    .tips h3 {
      font-size: 14px;
      font-weight: 600;
      color: #3A4D39;
      margin-bottom: 8px;
    }
    
    .tips ul {
      font-size: 13px;
      color: #5F6F5E;
      padding-left: 16px;
    }
    
    .tips li {
      margin-bottom: 4px;
    }
  </style>
  <script>
    function setView(mode) {
      const frame = document.querySelector('.preview-frame');
      const buttons = document.querySelectorAll('.view-btn');
      
      buttons.forEach(btn => btn.classList.remove('active'));
      event.target.classList.add('active');
      
      if (mode === 'mobile') {
        frame.classList.add('mobile');
      } else {
        frame.classList.remove('mobile');
      }
    }
  </script>
</head>
<body>
  <header class="header">
    <h1>📧 Email Template Preview</h1>
    <p>Preview and test MixWise automated email templates</p>
  </header>
  
  <div class="container">
    <aside class="sidebar">
      <h2>Templates</h2>
      <div class="template-list">
        ${templates.map(t => `
          <a href="/api/email-preview?template=${t.id}" class="template-link ${t.id === templateName.toLowerCase().replace(' ', '-') ? 'active' : ''}">
            <span>${t.name}</span>
            <small>Click to preview</small>
          </a>
        `).join('')}
      </div>
      
      <div class="view-controls">
        <h3>Preview Size</h3>
        <div class="view-buttons">
          <button class="view-btn active" onclick="setView('desktop')">🖥️ Desktop</button>
          <button class="view-btn" onclick="setView('mobile')">📱 Mobile</button>
        </div>
      </div>
      
      <div class="tips">
        <h3>💡 Testing Tips</h3>
        <ul>
          <li>Check button visibility</li>
          <li>Verify links are readable</li>
          <li>Test on actual email clients</li>
          <li>Check mobile responsiveness</li>
        </ul>
      </div>
    </aside>
    
    <main class="main">
      <div class="preview-header">
        <h2>${templateName}</h2>
        <p>Subject: ${subject}</p>
        <p class="from">From: <span>MixWise &lt;hello@getmixwise.com&gt;</span></p>
      </div>
      
      <div class="preview-frame">
        <iframe srcdoc="${emailHtml.replace(/"/g, '&quot;').replace(/</g, '&lt;').replace(/>/g, '&gt;')}" title="Email Preview"></iframe>
      </div>
    </main>
  </div>
  
  <script>
    // Fix the iframe srcdoc
    const iframe = document.querySelector('iframe');
    const srcdoc = iframe.getAttribute('srcdoc')
      .replace(/&quot;/g, '"')
      .replace(/&lt;/g, '<')
      .replace(/&gt;/g, '>');
    iframe.srcdoc = srcdoc;
  </script>
</body>
</html>
  `.trim();
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const template = searchParams.get("template") || "confirmation";

  // Fetch real cocktail data from database
  const { featured, samples } = await fetchCocktailsForPreview();
  
  // Use database data or fallback
  const featuredCocktail = featured || FALLBACK_FEATURED;
  const sampleCocktails = samples.length > 0 ? samples : FALLBACK_COCKTAILS;

  let templateName: string;
  let emailTemplate: { subject: string; html: string; text: string };

  switch (template) {
    case "welcome":
      templateName = "Welcome Email";
      emailTemplate = welcomeEmailTemplate({
        displayName: SAMPLE_DISPLAY_NAME,
        userEmail: SAMPLE_EMAIL,
        unsubscribeUrl: SAMPLE_UNSUBSCRIBE_URL,
      });
      break;
    case "weekly-digest":
      templateName = "Weekly Digest (with bar)";
      emailTemplate = weeklyDigestTemplate({
        displayName: SAMPLE_DISPLAY_NAME,
        userEmail: SAMPLE_EMAIL,
        unsubscribeUrl: SAMPLE_UNSUBSCRIBE_URL,
        cocktailsYouCanMake: sampleCocktails,
        featuredCocktail: featuredCocktail,
        barIngredientCount: 15,
      });
      break;
    case "weekly-digest-empty":
      templateName = "Weekly Digest (no bar)";
      emailTemplate = weeklyDigestTemplate({
        displayName: SAMPLE_DISPLAY_NAME,
        userEmail: SAMPLE_EMAIL,
        unsubscribeUrl: SAMPLE_UNSUBSCRIBE_URL,
        cocktailsYouCanMake: EMPTY_COCKTAILS,
        featuredCocktail: featuredCocktail,
        barIngredientCount: 0,
      });
      break;
    case "password-reset":
      templateName = "Password Reset";
      emailTemplate = resetPasswordTemplate({
        resetUrl: SAMPLE_RESET_URL,
        userEmail: SAMPLE_EMAIL,
      });
      break;
    case "wedding-recommendations":
      templateName = "Wedding Recommendations";
      emailTemplate = weddingRecommendationsTemplate({
        recommendations: [
          { name: "Old Fashioned", slug: "old-fashioned", base_spirit: "Whiskey" },
          { name: "Moscow Mule", slug: "moscow-mule", base_spirit: "Vodka" },
          { name: "Mojito", slug: "mojito", base_spirit: "Rum" },
          { name: "Negroni", slug: "negroni", base_spirit: "Gin" },
          { name: "Margarita", slug: "margarita", base_spirit: "Tequila" },
        ],
      });
      break;
    case "confirmation":
    default:
      templateName = "Email Confirmation";
      emailTemplate = confirmEmailTemplate({
        confirmUrl: SAMPLE_CONFIRM_URL,
        userEmail: SAMPLE_EMAIL,
      });
      break;
  }

  const previewHtml = wrapInPreviewPage(templateName, emailTemplate.html, emailTemplate.subject);

  return new NextResponse(previewHtml, {
    headers: {
      "Content-Type": "text/html; charset=utf-8",
      // Prevent caching during development
      "Cache-Control": "no-store, no-cache, must-revalidate",
    },
  });
}

