# 🎯 Growth Tactic #5: Social Sharing Optimization

## Overview

Optimize how Mixwise content appears when shared on social media platforms. Beautiful preview cards increase click-through rates and brand recognition.

**Why It Works:**
- Better click-through (attractive previews get more clicks)
- Brand recognition (consistent visual identity)
- Professional appearance (builds trust)
- Free traffic (organic shares)

**Impact**: 2-3x increase in click-through from social shares

---

## Current State Analysis

You already have:
- ✅ Open Graph tags in `lib/seo.ts`
- ✅ Twitter card support
- ✅ Basic sharing buttons in `ShareButtons.tsx`
- ✅ Shareable cocktail cards in `CocktailShareCard.tsx`

**What's Missing:**
- ❌ Dynamic OG images (using static `/og-image.jpg`)
- ❌ Optimized images for each page type
- ❌ Better share text pre-population
- ❌ Share tracking/analytics

---

## Implementation Plan

### Step 1: Dynamic OG Image Generation

Create dynamic Open Graph images for:
- Individual cocktails (with cocktail image)
- User results (from Mix tool)
- Challenge results
- Homepage (static is fine)

### Step 2: Optimize Existing OG Tags

- Ensure all pages have proper OG tags
- Add missing pages (Mix tool, Dashboard, etc.)
- Optimize descriptions for each page

### Step 3: Enhanced Share Buttons

- Pre-populate better share text
- Add more platforms (LinkedIn, Pinterest, etc.)
- Track share events

### Step 4: Share Analytics

- Track what gets shared
- Track click-through from shares
- Measure conversion from social traffic

---

## Detailed Implementation

### 1. Dynamic OG Image API Route

**File**: `app/api/og/route.tsx` (new file)

Using Vercel's OG Image generation or custom solution:

```typescript
import { ImageResponse } from 'next/og';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const type = searchParams.get('type');
  const title = searchParams.get('title') || 'MixWise';
  const description = searchParams.get('description') || 'A smarter way to make cocktails at home';
  const image = searchParams.get('image'); // Optional cocktail image URL

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#1e293b', // slate-800
          backgroundImage: 'linear-gradient(to bottom right, #0f172a, #1e293b, #0f172a)',
        }}
      >
        {image ? (
          // Cocktail-specific OG image
          <div style={{ display: 'flex', width: '100%', height: '100%' }}>
            <div style={{ width: '40%', height: '100%', position: 'relative' }}>
              <img
                src={image}
                alt=""
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            </div>
            <div style={{ 
              width: '60%', 
              padding: '60px', 
              display: 'flex', 
              flexDirection: 'column', 
              justifyContent: 'space-between' 
            }}>
              <div>
                <h1 style={{ 
                  fontSize: '64px', 
                  fontWeight: 'bold', 
                  color: 'white',
                  marginBottom: '20px',
                  lineHeight: '1.1',
                }}>
                  {title}
                </h1>
                <p style={{ 
                  fontSize: '28px', 
                  color: '#cbd5e1', 
                  marginTop: '20px' 
                }}>
                  {description}
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
                <div style={{
                  width: '64px',
                  height: '64px',
                  borderRadius: '50%',
                  background: 'linear-gradient(to bottom right, #84cc16, #10b981)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#0f172a',
                  fontSize: '24px',
                  fontWeight: 'bold',
                }}>
                  MW
                </div>
                <div>
                  <p style={{ color: 'white', fontSize: '24px', fontWeight: 'bold', margin: 0 }}>
                    MixWise
                  </p>
                  <p style={{ color: '#94a3b8', fontSize: '18px', margin: 0 }}>
                    getmixwise.com
                  </p>
                </div>
              </div>
            </div>
          </div>
        ) : (
          // Default OG image
          <div style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            alignItems: 'center', 
            justifyContent: 'center',
            padding: '80px',
            textAlign: 'center',
          }}>
            <h1 style={{ 
              fontSize: '80px', 
              fontWeight: 'bold', 
              color: 'white',
              marginBottom: '30px',
            }}>
              {title}
            </h1>
            <p style={{ 
              fontSize: '32px', 
              color: '#cbd5e1',
              maxWidth: '800px',
            }}>
              {description}
            </p>
            <div style={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: '20px',
              marginTop: '60px',
            }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'linear-gradient(to bottom right, #84cc16, #10b981)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0f172a',
                fontSize: '32px',
                fontWeight: 'bold',
              }}>
                MW
              </div>
              <div>
                <p style={{ color: 'white', fontSize: '28px', fontWeight: 'bold', margin: 0 }}>
                  MixWise
                </p>
                <p style={{ color: '#94a3b8', fontSize: '20px', margin: 0 }}>
                  getmixwise.com
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    ),
    {
      width: 1200,
      height: 630,
    }
  );
}
```

### 2. Update SEO Utility for Dynamic Images

**File**: `lib/seo.ts`

Update `generateCocktailMetadata` to use dynamic OG images:

```typescript
export function generateCocktailMetadata(cocktail: {
  name: string;
  slug?: { current: string };
  description?: string;
  externalImageUrl?: string;
  seoTitle?: string;
  metaDescription?: string;
  ingredients?: Array<any>;
  primarySpirit?: string;
}): Metadata {
  // ... existing code ...

  // Generate dynamic OG image URL
  const ogImageUrl = cocktail.externalImageUrl
    ? `${SITE_CONFIG.url}/api/og?type=cocktail&title=${encodeURIComponent(cocktail.name)}&description=${encodeURIComponent(description)}&image=${encodeURIComponent(cocktail.externalImageUrl)}`
    : `${SITE_CONFIG.url}/api/og?type=cocktail&title=${encodeURIComponent(cocktail.name)}&description=${encodeURIComponent(description)}`;

  return generatePageMetadata({
    title,
    description,
    path: `/cocktails/${cocktail.slug?.current}`,
    ogImage: ogImageUrl,
    keywords: [
      cocktail.name,
      "cocktail recipe",
      "cocktail",
      cocktail.primarySpirit,
      ...(cocktail.ingredients?.map((i) => i.ingredient?.name).filter(Boolean) || []),
    ].filter(Boolean) as string[],
  });
}
```

### 3. Add OG Tags to Mix Tool Page

**File**: `app/mix/page.tsx`

Add metadata for the Mix tool:

```typescript
import { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";

export const metadata: Metadata = generatePageMetadata({
  title: "Mix Tool - Find Cocktails You Can Make",
  description: "Discover what cocktails you can make with the ingredients you have at home. Add ingredients to your bar and get personalized recommendations.",
  path: "/mix",
});
```

### 4. Add OG Tags to Dashboard

**File**: `app/dashboard/page.tsx`

```typescript
import { Metadata } from "next";
import { generatePageMetadata } from "@/lib/seo";

export const metadata: Metadata = generatePageMetadata({
  title: "Dashboard - Your Cocktail Recommendations",
  description: "Your personalized cocktail dashboard. See recommendations based on your bar inventory and preferences.",
  path: "/dashboard",
});
```

### 5. Enhanced Share Buttons Component

**File**: `components/cocktails/ShareButtons.tsx`

Improve with better pre-populated text and more platforms:

```typescript
"use client";

import { useState } from "react";
import { ShareIcon, LinkIcon, CheckIcon } from "@heroicons/react/24/outline";
import { useToast } from "@/components/ui/toast";

// ... existing icon components ...

interface ShareButtonsProps {
  url: string;
  title: string;
  description?: string;
  image?: string;
}

export function ShareButtons({ url, title, description, image }: ShareButtonsProps) {
  const toast = useToast();
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);
  const encodedDescription = encodeURIComponent(description || title);

  // Improved share text
  const shareText = description 
    ? `${title} - ${description}`
    : `Check out ${title} on MixWise!`;

  const shareLinks = {
    twitter: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodeURIComponent(shareText)}&via=MixwiseApp`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`,
    pinterest: `https://pinterest.com/pin/create/button/?url=${encodedUrl}&description=${encodedDescription}${image ? `&media=${encodeURIComponent(image)}` : ''}`,
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied to clipboard");
      
      // Track share event
      if (typeof window !== "undefined" && window.gtag) {
        window.gtag("event", "share", {
          method: "copy_link",
          content_type: "cocktail",
          item_id: url,
        });
      }
      
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast.error("Failed to copy link");
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description || shareText,
          url,
        });
        
        // Track share event
        if (typeof window !== "undefined" && window.gtag) {
          window.gtag("event", "share", {
            method: "native",
            content_type: "cocktail",
            item_id: url,
          });
        }
      } catch (err) {
        if ((err as Error).name !== "AbortError") {
          toast.error("Failed to share");
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const handlePlatformShare = (platform: string, url: string) => {
    window.open(url, "_blank", "width=600,height=400");
    
    // Track share event
    if (typeof window !== "undefined" && window.gtag) {
      window.gtag("event", "share", {
        method: platform,
        content_type: "cocktail",
        item_id: url,
      });
    }
  };

  return (
    <div className="flex items-center gap-2 flex-wrap">
      {/* Native share (mobile) */}
      {typeof navigator !== "undefined" && typeof navigator.share === "function" && (
        <button
          onClick={handleNativeShare}
          className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-colors"
          aria-label="Share"
          title="Share"
        >
          <ShareIcon className="w-5 h-5" />
        </button>
      )}

      {/* Twitter/X */}
      <button
        onClick={() => handlePlatformShare("twitter", shareLinks.twitter)}
        className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-colors"
        aria-label="Share on X (Twitter)"
        title="Share on X"
      >
        <XIcon className="w-5 h-5" />
      </button>

      {/* Facebook */}
      <button
        onClick={() => handlePlatformShare("facebook", shareLinks.facebook)}
        className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-colors"
        aria-label="Share on Facebook"
        title="Share on Facebook"
      >
        <FacebookIcon className="w-5 h-5" />
      </button>

      {/* LinkedIn (optional) */}
      <button
        onClick={() => handlePlatformShare("linkedin", shareLinks.linkedin)}
        className="p-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-colors"
        aria-label="Share on LinkedIn"
        title="Share on LinkedIn"
      >
        <LinkedInIcon className="w-5 h-5" />
      </button>

      {/* Copy Link */}
      <button
        onClick={handleCopyLink}
        className={`p-2.5 rounded-xl transition-colors ${
          copied 
            ? "bg-lime-500/20 text-lime-400" 
            : "bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white"
        }`}
        aria-label="Copy link"
        title="Copy link"
      >
        {copied ? (
          <CheckIcon className="w-5 h-5" />
        ) : (
          <LinkIcon className="w-5 h-5" />
        )}
      </button>
    </div>
  );
}

// LinkedIn Icon Component
function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
    </svg>
  );
}
```

### 6. Add Share Tracking to Cocktail Pages

**File**: `app/cocktails/[slug]/page.tsx`

Add share tracking when page loads (if shared):

```typescript
"use client";

import { useEffect } from "react";
import { useSearchParams } from "next/navigation";

export default function CocktailPage() {
  const searchParams = useSearchParams();
  
  useEffect(() => {
    // Track if user came from a share
    const utmSource = searchParams.get("utm_source");
    if (utmSource === "share" || utmSource === "twitter" || utmSource === "facebook") {
      if (typeof window !== "undefined" && window.gtag) {
        window.gtag("event", "share_click", {
          method: utmSource,
          content_type: "cocktail",
        });
      }
    }
  }, [searchParams]);

  // ... rest of component
}
```

### 7. Update Share URLs to Include UTM Parameters

**File**: `components/cocktails/ShareButtons.tsx`

Add UTM parameters to track shares:

```typescript
const shareLinks = {
  twitter: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url + "?utm_source=twitter&utm_medium=share&utm_campaign=social")}&text=${encodeURIComponent(shareText)}&via=MixwiseApp`,
  facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url + "?utm_source=facebook&utm_medium=share&utm_campaign=social")}`,
  // ... etc
};
```

---

## Testing & Validation

### 1. Test OG Images

Use these tools to preview how your content appears:
- **Facebook Sharing Debugger**: https://developers.facebook.com/tools/debug/
- **Twitter Card Validator**: https://cards-dev.twitter.com/validator
- **LinkedIn Post Inspector**: https://www.linkedin.com/post-inspector/

### 2. Test Share Buttons

- Test on mobile (native share)
- Test on desktop (platform-specific)
- Verify UTM parameters are included
- Check analytics events fire

### 3. Validate Metadata

Check that all pages have:
- ✅ Title tag
- ✅ Meta description
- ✅ OG title
- ✅ OG description
- ✅ OG image (1200×630px)
- ✅ Twitter card
- ✅ Canonical URL

---

## Quick Wins Checklist

### Immediate (30 minutes)
- [ ] Add OG tags to Mix tool page
- [ ] Add OG tags to Dashboard
- [ ] Update share button text to be more engaging
- [ ] Add UTM parameters to share links

### Short-term (2-4 hours)
- [ ] Create dynamic OG image API route
- [ ] Update cocktail pages to use dynamic images
- [ ] Add LinkedIn share button
- [ ] Set up share tracking in analytics

### Long-term (1-2 days)
- [ ] Create OG images for all page types
- [ ] A/B test different share text
- [ ] Add Pinterest share (if relevant)
- [ ] Create share analytics dashboard

---

## Expected Impact

### Before Optimization
- **Click-through rate**: 2-3% from social shares
- **Brand recognition**: Low (generic previews)
- **Professional appearance**: Basic

### After Optimization
- **Click-through rate**: 5-8% (2-3x increase)
- **Brand recognition**: High (consistent branding)
- **Professional appearance**: Polished

### Traffic Impact
If you get 100 shares/month:
- **Before**: 2-3 clicks per share = 200-300 clicks/month
- **After**: 5-8 clicks per share = 500-800 clicks/month
- **Increase**: +300-500 clicks/month (+150-250%)

---

## Metrics to Track

### Share Metrics
- Total shares (by platform)
- Share rate (% of visitors who share)
- Click-through from shares
- Conversion from social traffic

### Engagement Metrics
- Time on site from social traffic
- Pages per session from social
- Bounce rate from social

### Brand Metrics
- Brand searches (people searching "Mixwise" after seeing share)
- Direct traffic increase
- Social media mentions

---

## Best Practices

### OG Image Guidelines
- **Size**: 1200×630px (1.91:1 ratio)
- **File size**: < 1MB (optimize images)
- **Text**: Keep text minimal (some platforms crop)
- **Branding**: Include logo/branding consistently

### Share Text Guidelines
- **Length**: Twitter (280 chars), Facebook (no limit but keep concise)
- **Engagement**: Ask questions, use emojis
- **Value**: Highlight benefit, not just link
- **Call-to-action**: Include clear CTA

### Platform-Specific Tips

**Twitter/X**:
- Use hashtags (#cocktails, #mixology)
- Tag @MixwiseApp
- Keep under 280 characters

**Facebook**:
- Longer descriptions work better
- Use engaging questions
- Include image when possible

**LinkedIn**:
- More professional tone
- Focus on value/benefit
- Less emoji use

---

## Next Steps

1. ✅ Test current OG tags with Facebook/Twitter validators
2. ✅ Add missing OG tags to key pages
3. ✅ Create dynamic OG image API route
4. ✅ Update share buttons with better text
5. ✅ Add share tracking
6. ✅ Test and validate
7. ✅ Monitor metrics and iterate

---

## Resources

- [Open Graph Protocol](https://ogp.me/)
- [Twitter Cards](https://developer.twitter.com/en/docs/twitter-for-websites/cards/overview/abouts-cards)
- [Facebook Sharing Best Practices](https://developers.facebook.com/docs/sharing/best-practices)
- [Next.js Image Optimization](https://nextjs.org/docs/app/api-reference/components/image)

