# 🎯 Growth Tactic #1: "What Can I Make?" Shareable Results

## Overview

Generate beautiful, shareable images when users check what cocktails they can make with their bar inventory. This creates viral content that drives new user acquisition.

**Why It Works:**
- Social proof (people love showing off)
- FOMO (others see what they're missing)
- Low friction (one click to share)
- Visual content performs 10x better than text

---

## User Flow

1. User adds ingredients to their bar on `/mix` page
2. Mix tool shows results: "You can make 12 cocktails!"
3. **NEW**: "Share My Results" button appears
4. User clicks → beautiful image generated showing:
   - "I can make 12 cocktails with what's in my bar!"
   - Grid of cocktail thumbnails
   - Mixwise branding
   - Referral link (if user is logged in)
5. User shares to Twitter/X, Instagram, Facebook, or downloads image

---

## Implementation Plan

### Step 1: Create Shareable Results Component

**File**: `components/mix/ShareableResultsCard.tsx`

This component will:
- Generate a shareable image using `html-to-image` (already in dependencies!)
- Show preview of the card
- Provide share buttons (Twitter, Facebook, native share, download)
- Include referral link if user is logged in

**Key Features:**
- Beautiful design matching Mixwise brand
- Shows cocktail count prominently
- Grid of cocktail thumbnails (top 6-9 cocktails)
- Mixwise logo and branding
- Call-to-action: "Try Mixwise" with referral link

### Step 2: Add to MixResultsPanel

**File**: `components/mix/MixResultsPanel.tsx`

Add the shareable results component to the results panel, showing it when:
- User has at least 1 cocktail they can make
- Show prominently at the top of results

### Step 3: Referral Link Integration

**File**: `lib/referrals.ts` (new file)

Create referral system:
- Generate unique referral code for each user
- Store in `profiles` table (add `referral_code` column)
- Create referral tracking table: `referrals`
- Build referral URLs: `getmixwise.com/signup?ref=ABC123`

### Step 4: Analytics Tracking

Track:
- Share button clicks
- Share method (Twitter, Facebook, download, etc.)
- Referral link clicks from shares
- Signups from referral links

---

## Detailed Code Implementation

### 1. Database Migration: Add Referral System

**File**: `supabase/migrations/019_add_referral_system.sql`

```sql
-- Add referral_code to profiles table
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS referral_code TEXT UNIQUE;

-- Generate referral codes for existing users
UPDATE profiles 
SET referral_code = LOWER(SUBSTRING(MD5(RANDOM()::TEXT || id::TEXT) FROM 1 FOR 8))
WHERE referral_code IS NULL;

-- Create function to generate unique referral codes
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
DECLARE
  new_code TEXT;
  exists BOOLEAN;
BEGIN
  LOOP
    new_code := LOWER(SUBSTRING(MD5(RANDOM()::TEXT || NOW()::TEXT) FROM 1 FOR 8));
    SELECT EXISTS(SELECT 1 FROM profiles WHERE referral_code = new_code) INTO exists;
    EXIT WHEN NOT exists;
  END LOOP;
  RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- Auto-generate referral code on profile creation
CREATE OR REPLACE FUNCTION auto_generate_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := generate_referral_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_referral_code_on_insert
BEFORE INSERT ON profiles
FOR EACH ROW
EXECUTE FUNCTION auto_generate_referral_code();

-- Create referrals tracking table
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  referred_id UUID REFERENCES profiles(id) ON DELETE SET NULL,
  referral_code TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- pending, completed, expired
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,
  UNIQUE(referrer_id, referred_id)
);

-- Index for lookups
CREATE INDEX IF NOT EXISTS idx_referrals_code ON referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_referrals_referrer ON referrals(referrer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_referred ON referrals(referred_id);

-- RLS policies
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own referrals"
  ON referrals FOR SELECT
  USING (auth.uid() = referrer_id OR auth.uid() = referred_id);

CREATE POLICY "Users can create referrals"
  ON referrals FOR INSERT
  WITH CHECK (auth.uid() = referrer_id);
```

### 2. Referral Utility Functions

**File**: `lib/referrals.ts` (new file)

```typescript
import { createClient } from "@/lib/supabase/client";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Get or create referral code for a user
 */
export async function getUserReferralCode(userId: string): Promise<string | null> {
  const supabase = createClient();
  
  // Get user's referral code
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("referral_code")
    .eq("id", userId)
    .single();

  if (error || !profile) {
    console.error("Error fetching referral code:", error);
    return null;
  }

  // If no code exists, generate one (shouldn't happen due to trigger, but safety check)
  if (!profile.referral_code) {
    // This would require admin client to update
    console.warn("User has no referral code, should be auto-generated");
    return null;
  }

  return profile.referral_code;
}

/**
 * Get referral URL for a user
 */
export async function getReferralUrl(userId: string): Promise<string> {
  const code = await getUserReferralCode(userId);
  if (!code) {
    return `${process.env.NEXT_PUBLIC_SITE_URL || "https://getmixwise.com"}/signup`;
  }
  return `${process.env.NEXT_PUBLIC_SITE_URL || "https://getmixwise.com"}/signup?ref=${code}`;
}

/**
 * Track referral signup
 */
export async function trackReferralSignup(referralCode: string, newUserId: string): Promise<void> {
  const supabaseAdmin = createAdminClient();
  
  // Find the referrer by code
  const { data: referrer } = await supabaseAdmin
    .from("profiles")
    .select("id")
    .eq("referral_code", referralCode)
    .single();

  if (!referrer) {
    console.warn(`No referrer found for code: ${referralCode}`);
    return;
  }

  // Don't allow self-referrals
  if (referrer.id === newUserId) {
    return;
  }

  // Create or update referral record
  const { error } = await supabaseAdmin
    .from("referrals")
    .upsert({
      referrer_id: referrer.id,
      referred_id: newUserId,
      referral_code: referralCode,
      status: "completed",
      completed_at: new Date().toISOString(),
    }, {
      onConflict: "referrer_id,referred_id",
    });

  if (error) {
    console.error("Error tracking referral:", error);
  }
}

/**
 * Get referral stats for a user
 */
export async function getReferralStats(userId: string): Promise<{
  totalReferrals: number;
  completedReferrals: number;
  pendingReferrals: number;
}> {
  const supabase = createClient();
  
  const { data: referrals, error } = await supabase
    .from("referrals")
    .select("status")
    .eq("referrer_id", userId);

  if (error) {
    console.error("Error fetching referral stats:", error);
    return { totalReferrals: 0, completedReferrals: 0, pendingReferrals: 0 };
  }

  const total = referrals?.length || 0;
  const completed = referrals?.filter(r => r.status === "completed").length || 0;
  const pending = referrals?.filter(r => r.status === "pending").length || 0;

  return { totalReferrals: total, completedReferrals: completed, pendingReferrals: pending };
}
```

### 3. Shareable Results Card Component

**File**: `components/mix/ShareableResultsCard.tsx` (new file)

```typescript
"use client";

import { useRef, useState } from "react";
import { toPng } from "html-to-image";
import { useUser } from "@/components/auth/UserProvider";
import { useToast } from "@/components/ui/toast";
import { getReferralUrl } from "@/lib/referrals";
import { getSiteUrl } from "@/lib/site";
import {
  ShareIcon,
  ArrowDownTrayIcon,
  LinkIcon,
  CheckIcon,
} from "@heroicons/react/24/outline";
import Image from "next/image";
import type { MixCocktail } from "@/lib/mixTypes";

interface ShareableResultsCardProps {
  cocktailCount: number;
  cocktails: MixCocktail[];
  ingredientCount: number;
}

export function ShareableResultsCard({
  cocktailCount,
  cocktails,
  ingredientCount,
}: ShareableResultsCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [referralUrl, setReferralUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const toast = useToast();
  const { user } = useUser();

  // Get referral URL if user is logged in
  useState(() => {
    if (user) {
      getReferralUrl(user.id).then(setReferralUrl);
    } else {
      setReferralUrl(`${getSiteUrl()}/signup`);
    }
  });

  // Get top cocktails to display (up to 9 in a 3x3 grid)
  const displayCocktails = cocktails.slice(0, 9);

  const handleDownload = async () => {
    if (!cardRef.current) return;

    setIsGenerating(true);

    try {
      const dataUrl = await toPng(cardRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        width: 1200,
        height: 630,
        backgroundColor: "#1e293b", // slate-800
      });

      // Create download link
      const link = document.createElement("a");
      link.download = `mixwise-results-${cocktailCount}-cocktails.png`;
      link.href = dataUrl;
      link.click();

      toast.success("Share card downloaded!");

      // Track share event (if you have analytics)
      // trackEvent('share_results', { method: 'download', cocktailCount });
    } catch (error) {
      console.error("Error generating share card:", error);
      toast.error("Failed to generate share card");
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCopyLink = async () => {
    const url = referralUrl || `${getSiteUrl()}/signup`;
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      toast.success("Link copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy link");
    }
  };

  const handleNativeShare = async () => {
    const url = referralUrl || `${getSiteUrl()}/signup`;
    const text = `I can make ${cocktailCount} cocktails with what's in my bar! 🍸 Try Mixwise to discover what you can make:`;

    if (navigator.share) {
      try {
        await navigator.share({
          title: "My Mixwise Results",
          text,
          url,
        });
      } catch (error) {
        if ((error as Error).name !== "AbortError") {
          console.error("Error sharing:", error);
        }
      }
    } else {
      handleCopyLink();
    }
  };

  const handleTwitterShare = () => {
    const url = referralUrl || `${getSiteUrl()}/signup`;
    const text = encodeURIComponent(
      `I can make ${cocktailCount} cocktails with what's in my bar! 🍸 Try @MixwiseApp to discover what you can make:`
    );
    window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`, "_blank");
  };

  const handleFacebookShare = () => {
    const url = referralUrl || `${getSiteUrl()}/signup`;
    window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, "_blank");
  };

  return (
    <div className="space-y-4">
      {/* Share Buttons */}
      <div className="flex flex-wrap gap-2">
        <button
          onClick={handleDownload}
          disabled={isGenerating}
          className="flex items-center gap-2 px-4 py-2 bg-lime-500 hover:bg-lime-400 text-slate-900 font-bold text-sm rounded-lg transition-colors disabled:opacity-50"
        >
          <ArrowDownTrayIcon className="w-4 h-4" />
          {isGenerating ? "Generating..." : "Download & Share"}
        </button>

        <button
          onClick={handleTwitterShare}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm rounded-lg transition-colors"
        >
          <ShareIcon className="w-4 h-4" />
          Share on X
        </button>

        <button
          onClick={handleFacebookShare}
          className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm rounded-lg transition-colors"
        >
          <ShareIcon className="w-4 h-4" />
          Share on Facebook
        </button>

        {typeof navigator !== "undefined" && !!navigator.share && (
          <button
            onClick={handleNativeShare}
            className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm rounded-lg transition-colors"
          >
            <ShareIcon className="w-4 h-4" />
            Share
          </button>
        )}

        <button
          onClick={handleCopyLink}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-colors text-sm ${
            copied
              ? "bg-lime-500/20 text-lime-400"
              : "bg-slate-800 hover:bg-slate-700 text-slate-200"
          }`}
        >
          {copied ? (
            <>
              <CheckIcon className="w-4 h-4" />
              Copied!
            </>
          ) : (
            <>
              <LinkIcon className="w-4 h-4" />
              Copy Link
            </>
          )}
        </button>
      </div>

      {/* Preview Card (hidden but used for generation) */}
      <div className="relative overflow-hidden rounded-xl border border-slate-700">
        <div
          ref={cardRef}
          className="relative bg-slate-800"
          style={{ width: "1200px", height: "630px" }}
        >
          {/* Background gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900" />

          {/* Content */}
          <div className="relative h-full p-12 flex flex-col">
            {/* Header */}
            <div className="mb-8">
              <h2 className="text-6xl font-serif font-bold text-white mb-4 leading-tight">
                I can make
              </h2>
              <div className="flex items-baseline gap-4">
                <span className="text-8xl font-serif font-bold text-lime-400">
                  {cocktailCount}
                </span>
                <span className="text-5xl font-serif font-bold text-white">
                  cocktails
                </span>
              </div>
              <p className="text-2xl text-slate-300 mt-4">
                with what's in my bar
              </p>
            </div>

            {/* Cocktail Grid */}
            <div className="flex-1 grid grid-cols-3 gap-4 mb-8">
              {displayCocktails.map((cocktail, index) => (
                <div
                  key={cocktail.id || index}
                  className="relative aspect-square rounded-lg overflow-hidden bg-slate-700"
                >
                  {cocktail.imageUrl ? (
                    <img
                      src={cocktail.imageUrl}
                      alt={cocktail.name}
                      className="w-full h-full object-cover"
                      crossOrigin="anonymous"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-4xl">
                      🍸
                    </div>
                  )}
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-slate-900/90 to-transparent p-2">
                    <p className="text-xs font-medium text-white truncate">
                      {cocktail.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-lime-400 to-emerald-600 flex items-center justify-center text-slate-900 text-lg font-bold">
                  MW
                </div>
                <div>
                  <p className="text-white font-bold text-xl">MixWise</p>
                  <p className="text-slate-400 text-sm">getmixwise.com</p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-slate-300 text-lg">
                  Try Mixwise to discover what you can make
                </p>
              </div>
            </div>
          </div>
        </div>
        <p className="text-xs text-slate-500 p-2 text-center bg-slate-900">
          Preview (card will be 1200×630px when downloaded)
        </p>
      </div>
    </div>
  );
}
```

### 4. Integrate into MixResultsPanel

**File**: `components/mix/MixResultsPanel.tsx`

Add the shareable card at the top of results:

```typescript
// Add import
import { ShareableResultsCard } from "./ShareableResultsCard";

// Inside the component, add after the category picker:
{ready.length > 0 && (
  <div className="mb-8">
    <ShareableResultsCard
      cocktailCount={ready.length}
      cocktails={ready.map(r => r.cocktail)}
      ingredientCount={inventoryIds.length}
    />
  </div>
)}
```

### 5. Handle Referral Signups

**File**: `app/auth/signup/page.tsx` or wherever signup happens

Check for `ref` parameter and track referral:

```typescript
import { trackReferralSignup } from "@/lib/referrals";

// In signup handler, after user is created:
const searchParams = useSearchParams();
const referralCode = searchParams.get("ref");

if (referralCode && newUserId) {
  await trackReferralSignup(referralCode, newUserId);
}
```

---

## Design Considerations

### Card Design
- **Size**: 1200×630px (standard Open Graph image size)
- **Colors**: Match Mixwise brand (slate-800 background, lime-400 accent)
- **Typography**: Large, bold numbers for impact
- **Layout**: Header with count → Grid of cocktails → Footer with branding

### Cocktail Grid
- Show top 9 cocktails in 3×3 grid
- Use cocktail images if available
- Fallback to emoji if no image
- Show cocktail name overlay

### Branding
- Mixwise logo in footer
- Website URL
- Call-to-action text

---

## Analytics & Tracking

### Events to Track
1. **Share button clicked** - Which button (download, Twitter, Facebook, etc.)
2. **Share card generated** - Success/failure
3. **Referral link clicked** - From shared cards
4. **Signup from referral** - Conversion tracking

### Metrics to Monitor
- Share rate (% of users who share results)
- Share method distribution
- Referral link click-through rate
- Signup conversion from referrals

---

## Testing Checklist

- [ ] Share card generates correctly
- [ ] Image downloads successfully
- [ ] Twitter share opens with correct text
- [ ] Facebook share opens with correct URL
- [ ] Referral links work for logged-in users
- [ ] Referral tracking works on signup
- [ ] Card looks good on different screen sizes (preview)
- [ ] Handles edge cases (0 cocktails, 1 cocktail, 100+ cocktails)
- [ ] Works for logged-out users (no referral link)

---

## Future Enhancements

1. **Personalized messaging**: "You're a [spirit] enthusiast!" based on ingredients
2. **Achievement badges**: "Well Stocked Bar", "Minimalist Mixologist"
3. **Comparison**: "You can make more cocktails than 80% of users!"
4. **Seasonal themes**: Different card designs for holidays
5. **Video generation**: Animated share cards (more engaging)

---

## Expected Impact

- **Share rate**: 5-10% of users who can make cocktails
- **Click-through**: 10-20% of people who see shared cards
- **Signup conversion**: 20-30% of referral link clicks
- **Viral coefficient**: 0.1-0.3 (each user brings 0.1-0.3 new users)

**Example**: 1000 users → 50 shares → 500 views → 100 clicks → 20-30 new signups

---

## Next Steps

1. ✅ Create database migration for referral system
2. ✅ Build ShareableResultsCard component
3. ✅ Integrate into MixResultsPanel
4. ✅ Add referral tracking to signup flow
5. ✅ Test and iterate on design
6. ✅ Launch and monitor metrics

