# Data Sources Audit Report - MixWise

## Executive Summary

This report documents a comprehensive investigation of data sources, caching behavior, and content update patterns in the MixWise application. The investigation reveals a **dual-source architecture** where cocktail content is primarily managed in Sanity CMS, while user-specific data (favorites, shopping lists, bar ingredients) resides in Supabase. However, critical issues with content updates and image loading have been identified.

## Key Findings

1. **Content Update Problem**: Cocktail detail pages use ISR with 60-second revalidation, but the Sanity client has `useCdn: false`, causing inconsistent content updates.

2. **Image Reliability Issues**: Image domains are properly configured, but Sanity images depend on the CDN being accessible and properly configured.

3. **Dual Data Architecture**: Sanity handles all cocktail/ingredient content, while Supabase manages user data - this appears intentional and well-structured.

## Data Sources Inventory

### Sanity CMS Client

| Client Name | File Path | Type | Environment Variables | Project ID/Dataset | Notes |
|-------------|-----------|------|----------------------|-------------------|-------|
| `sanityClient` | `lib/sanityClient.ts` | Sanity | `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `NEXT_PUBLIC_SANITY_API_VERSION` | `hqga2p7i` / `production` | **CDN disabled** (`useCdn: false`) |
| `sanity` (migration) | `scripts/migrate-to-sanity.ts` | Sanity | `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `SANITY_API_TOKEN` | `hqga2p7i` / `production` | Migration script client |
| Sanity Studio | `sanity.config.ts` | Sanity | `NEXT_PUBLIC_SANITY_PROJECT_ID`, `NEXT_PUBLIC_SANITY_DATASET`, `SANITY_AUTH_TOKEN` | `hqga2p7i` / `production` | Studio configuration |

### Supabase Clients

| Client Name | File Path | Type | Environment Variables | Supabase URL | Notes |
|-------------|-----------|------|----------------------|--------------|-------|
| `createClient` | `lib/supabase/client.ts` | Supabase | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | N/A (via auth helpers) | Client-side client |
| `createServerClient` | `lib/supabase/server.ts` | Supabase | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` | N/A (via auth helpers) | Server-side client |

### Static Data Sources

| Data Source | File Path | Type | Notes |
|-------------|-----------|------|-------|
| `cocktails.enriched.ndjson` | `cocktails.enriched.ndjson` | Static NDJSON | Exported Sanity data (~442 records), appears to be a backup/export file |

## Cocktail Detail Data Flow

### Page: `/cocktails/[slug]`

**File Location**: `app/cocktails/[slug]/page.tsx`

**Data Source**: **Sanity CMS only**

**Query Details**:
- **Client**: `sanityClient` (from `lib/sanityClient.ts`)
- **Query Type**: GROQ fetch
- **Query**: Complex GROQ query fetching single cocktail by slug with full ingredient data
- **Caching**: ISR (Incremental Static Regeneration)
- **Revalidation**: `export const revalidate = 60` (60 seconds)
- **Dynamic Mode**: `export const dynamic = 'force-dynamic'`

**Key Code**:
```typescript
const COCKTAIL_QUERY = `*[_type == "cocktail" && slug.current == $slug][0]{...}`;
const cocktail: SanityCocktail | null = await sanityClient.fetch(COCKTAIL_QUERY, { slug });
```

**Build Behavior**:
- Pre-generates static pages for all known cocktail slugs via `generateStaticParams()`
- Falls back to server-side rendering for new/unknown slugs
- Revalidates content every 60 seconds

## Cocktail Directory Data Flow

### Page: `/cocktails`

**File Location**: `app/cocktails/page.tsx`

**Data Source**: **Sanity CMS only**

**Query Details**:
- **Client**: `sanityClient` (from `lib/sanityClient.ts`)
- **Query Type**: GROQ fetch
- **Query**: Fetches all cocktails with ingredient references
- **Caching**: ISR (Incremental Static Regeneration)
- **Revalidation**: `export const revalidate = 60` (60 seconds)

**Key Code**:
```typescript
const COCKTAILS_QUERY = `*[_type == "cocktail"] {...}`;
const cocktails: SanityCocktail[] = await sanityClient.fetch(COCKTAILS_QUERY);
```

## Mix Page Data Flow

### Page: `/mix`

**File Location**: `app/mix/page.tsx`

**Data Source**: **Sanity CMS only**

**Data Fetching**:
- **Client**: `sanityClient` via `fetchMixData()` (from `lib/sanityMixData.ts`)
- **Query Type**: GROQ fetches for both ingredients and cocktails
- **Caching**: Client-side data loading (no ISR/SSG)
- **Revalidation**: On every page load (client-side fetch)

**Key Code**:
```typescript
// In lib/sanityMixData.ts
const { ingredients, cocktails } = await fetchMixData();

// In app/mix/page.tsx
useEffect(() => {
  async function loadData() {
    const { ingredients, cocktails } = await fetchMixData();
    setAllIngredients(ingredients);
    setAllCocktails(cocktails);
  }
  loadData();
}, []);
```

**User Data Integration**:
- Bar ingredients stored in Supabase (`bar_ingredients` table)
- Managed via `useBarIngredients` hook
- Syncs between localStorage (anonymous) and Supabase (authenticated)

## Images & Media

### Image Domains Configuration

**File**: `next.config.js`

```javascript
images: {
  remotePatterns: [
    { protocol: 'https', hostname: 'cdn.sanity.io', pathname: '/images/**' },
    { protocol: 'https', hostname: '*.public.blob.vercel-storage.com', pathname: '/**' },
    { protocol: 'https', hostname: 'usgsomofsav4obpi.public.blob.vercel-storage.com', pathname: '/**' },
    { protocol: 'https', hostname: 'images.unsplash.com', pathname: '/**' },
    { protocol: 'https', hostname: 'lh3.googleusercontent.com', pathname: '/**' },
  ]
}
```

### Image URL Generation

**Sanity Images**:
- **Helper**: `lib/sanityImage.ts`
- **Function**: `getImageUrl(source, options)`
- **CDN**: `cdn.sanity.io`
- **Fallback**: `cocktail.externalImageUrl` (external URLs)

**Key Code**:
```typescript
// In cocktail detail page
const imageUrl = getImageUrl(cocktail.image, { width: 1200, height: 1200 }) || cocktail.externalImageUrl || null;
```

### Potential Image Issues

1. **Domain Coverage**: All major image sources appear covered
2. **Sanity CDN Dependency**: All Sanity images rely on `cdn.sanity.io` being accessible
3. **Fallback Logic**: Proper fallback to `externalImageUrl` when Sanity images fail
4. **Image Loading**: Uses Next.js `Image` component with proper sizing

## Caching / Revalidation Behavior

### Current Configuration Summary

| Page | Caching Type | Revalidation | Dynamic Mode | Data Freshness |
|------|-------------|--------------|--------------|----------------|
| `/cocktails/[slug]` | ISR | 60 seconds | `force-dynamic` | Updates every 60s |
| `/cocktails` | ISR | 60 seconds | Default (static) | Updates every 60s |
| `/mix` | Client-side | On page load | N/A | Always fresh |

### Critical Issues Identified

1. **Sanity Client Configuration Conflict**:
   ```typescript
   // In lib/sanityClient.ts
   useCdn: false,  // Forces fresh data from API
   ```
   **Issue**: Despite ISR revalidation every 60 seconds, the Sanity client bypasses the CDN, potentially causing slower loads and inconsistent caching behavior.

2. **ISR vs Client-side Inconsistency**:
   - Cocktail pages use ISR (good for performance)
   - Mix page uses client-side fetching (always fresh but slower initial load)

## Config Drift & Multiple Clients

### No Critical Drift Found

- All Sanity clients consistently use `hqga2p7i` / `production`
- No conflicting project IDs or datasets detected
- Supabase clients are properly abstracted through auth helpers

### Architecture Notes

- **Clean Separation**: Sanity for content, Supabase for user data
- **Migration History**: Evidence of Supabase → Sanity migration in scripts
- **User Data**: Properly isolated in Supabase (favorites, shopping lists, bar ingredients)

## Diagnosis: Why Content Doesn't Update

### Primary Issue: ISR + No-CDN Conflict

The cocktail detail and directory pages use **Incremental Static Regeneration** with 60-second revalidation, but the Sanity client has `useCdn: false`. This creates a conflict:

1. **ISR expects** cached content from the CDN to be invalidated periodically
2. **Client configuration** forces fresh API calls, bypassing CDN entirely
3. **Result**: Slower performance + potential cache invalidation issues

### Why Mai Tai (and other recipes) Don't Show New Fields

**Enriched fields** (like new flavor profiles, fun facts, or best-for categories) should appear immediately due to ISR revalidation. However:

1. **If CDN is bypassed**: Fresh data comes directly from Sanity API, which should have latest content
2. **If ISR cache is stale**: New deployments might be needed to clear static cache
3. **Live site behavior**: Likely depends on whether Vercel is properly invalidating ISR caches

### Why Images Sometimes Fail

**Not a domain issue** - all image domains are properly configured. Potential causes:

1. **Sanity CDN outages**: `cdn.sanity.io` may be temporarily unavailable
2. **Image asset corruption**: Sanity images may fail to generate properly
3. **Fallback logic works**: External URLs should load when Sanity images fail
4. **Build-time vs runtime**: ISR may cache broken image URLs

## Recommended Paths Forward

### Option A: Optimize for Reliability (Recommended)
**Make Sanity the single source of truth with optimized caching**

- Keep Sanity for all cocktail content (current approach)
- **Change**: Remove `useCdn: false` from Sanity client to leverage proper ISR
- **Change**: Increase revalidation to 300 seconds (5 minutes) for better performance
- **Benefit**: Faster loads, reliable ISR, consistent content updates

### Option B: Hybrid Approach
**Keep current dual-source but improve caching**

- Maintain Supabase for user data, Sanity for content
- **Change**: Implement proper cache headers and ISR optimization
- **Change**: Add manual revalidation webhooks for critical content updates
- **Benefit**: Preserves current architecture while fixing update issues

### Option C: Full Migration
**Move everything to Supabase (if Sanity proves problematic)**

- Migrate cocktail content back to Supabase tables
- Remove Sanity dependency entirely
- Use Supabase RLS for content management
- **Risk**: Loss of CMS benefits, more complex content editing

## Implementation Priority

1. **High Priority**: Fix Sanity client caching conflict
2. **Medium Priority**: Monitor image loading reliability
3. **Low Priority**: Consider architecture consolidation (if issues persist)

---

*Report generated: December 1, 2025*
*Investigation completed without code changes*
