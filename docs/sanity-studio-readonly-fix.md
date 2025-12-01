# Sanity Studio Read-Only Mode Fix

## Problem Identified
Sanity Studio was in read-only mode because the configuration was missing the required authentication token for write access in Sanity v3.

## Root Cause
In Sanity v3 (sanity package version 4.x), Studio requires an authentication token (`SANITY_AUTH_TOKEN`) to have write access to documents. Without this token, Studio operates in read-only mode.

## Changes Made

### 1. Updated `sanity.config.ts`
- Added `auth` configuration with token from environment variable
- Added debug tool (development-only) to display current project configuration
- Token configuration: `auth: authToken ? { token: authToken } : undefined`

### 2. Environment Variables Required
The following environment variables need to be set in `.env.local`:

```bash
# Sanity Configuration
NEXT_PUBLIC_SANITY_PROJECT_ID=hqga2p7i
NEXT_PUBLIC_SANITY_DATASET=production

# Sanity Auth Token for Studio write access (REQUIRED)
# Generate at: https://sanity.io/manage -> API -> Tokens
# Token needs Editor or Administrator permissions
SANITY_AUTH_TOKEN=your_actual_token_here
```

## How to Get the Auth Token

1. Go to [https://sanity.io/manage](https://sanity.io/manage)
2. Select your project (`hqga2p7i`)
3. Go to API → Tokens
4. Create a new token with "Editor" or "Administrator" permissions
5. Copy the token and add it to `.env.local` as `SANITY_AUTH_TOKEN`

## Testing the Fix

1. Set the `SANITY_AUTH_TOKEN` in your `.env.local` file
2. Run `npm run dev` or `yarn dev`
3. Navigate to `/studio`
4. Open a cocktail document
5. Verify you can edit fields and save/publish changes

## Debug Information

In development mode, Studio now includes a "Project Info" tool that shows:
- Current project ID
- Current dataset
- Whether auth token is configured

This helps diagnose configuration issues.

## Current Configuration
- **Project ID**: `hqga2p7i`
- **Dataset**: `production`
- **Auth Token**: Required but not committed (set in .env.local)

## Files Changed
- `sanity.config.ts` - Added auth token configuration and debug tool
