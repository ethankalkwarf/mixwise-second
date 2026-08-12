#!/bin/bash
# Fix build configuration for Capacitor + CocoaPods

set -e

echo "🔧 Fixing Capacitor build configuration..."

# Clean everything
echo "1. Cleaning DerivedData..."
rm -rf ~/Library/Developer/Xcode/DerivedData/App-*

# Reinstall pods with static frameworks
echo "2. Reinstalling CocoaPods..."
pod deintegrate > /dev/null 2>&1 || true
pod install

# Sync Capacitor
echo "3. Syncing Capacitor..."
cd ../..
npx cap sync ios > /dev/null 2>&1

echo "✅ Build configuration fixed!"
echo ""
echo "Next steps in Xcode:"
echo "1. Open App.xcworkspace (NOT .xcodeproj)"
echo "2. Product → Clean Build Folder (Cmd + Shift + K)"
echo "3. Select a simulator"
echo "4. Product → Build (Cmd + B)"
echo ""
echo "Important: Make sure Pods project appears in Project Navigator!"
