#!/bin/bash

# Auth Timeout Fixes Deployment Script
# Fixes Issue #3: Authenticated users experiencing blank pages due to aggressive timeouts

set -e

echo "🚀 Deploying Auth Timeout Fixes"
echo "================================="
echo ""

# Check if we're in the right directory
if [ ! -f "components/auth/UserProvider.tsx" ]; then
    echo "❌ Error: Not in the correct project directory"
    echo "   Please run this script from the mixwise-second project root"
    exit 1
fi

# Check git status
echo "📋 Checking git status..."
if [ -n "$(git status --porcelain)" ]; then
    echo "⚠️  Warning: You have uncommitted changes"
    echo "   The following files will be committed:"
    git status --short
    echo ""
    read -p "Continue? (y/N): " -n 1 -r
    echo ""
    if [[ ! $REPLY =~ ^[Yy]$ ]]; then
        exit 1
    fi
fi

# Commit the changes
echo "📝 Committing auth timeout fixes..."
git add components/auth/UserProvider.tsx AUTH_TIMEOUT_FIXES.md
git commit -m "Fix auth timeouts causing blank pages for authenticated users

- Increase profile fetch timeout from 1s to 3s
- Increase profile creation timeout from 1s to 2s
- Increase auth init timeout from 1.5s to 5s
- Add retry logic for profile fetches
- Make timeouts configurable via environment variables
- Fix Issue #3: Authenticated users seeing blank dashboard/account pages"

# Optional: Set environment variables for production
echo ""
echo "🔧 Optional: Configure timeout environment variables in Vercel"
echo "   These are optional - defaults will work for most cases:"
echo ""
echo "   NEXT_PUBLIC_PROFILE_FETCH_TIMEOUT=3000"
echo "   NEXT_PUBLIC_PROFILE_CREATE_TIMEOUT=2000"
echo "   NEXT_PUBLIC_AUTH_INIT_TIMEOUT=5000"
echo ""

# Deploy to Vercel
echo "🚀 Deploying to Vercel..."
echo "   This will trigger a production deployment"
echo ""

if command -v vercel &> /dev/null; then
    vercel --prod
    echo ""
    echo "✅ Deployment complete!"
    echo ""
    echo "🧪 Test the fixes:"
    echo "   1. Visit https://www.getmixwise.com/dashboard (logged in)"
    echo "   2. Visit https://www.getmixwise.com/account (logged in)"
    echo "   3. Check browser console for reduced timeout errors"
    echo "   4. Pages should now load with proper content instead of blank"
else
    echo "⚠️  Vercel CLI not found. Please deploy manually:"
    echo "   1. Push to main branch: git push origin main"
    echo "   2. Vercel will auto-deploy"
    echo "   3. Monitor deployment in Vercel dashboard"
fi

echo ""
echo "📖 Documentation: AUTH_TIMEOUT_FIXES.md"
echo "🎯 Issue Fixed: Issue #3 - Auth timeouts causing blank pages"
