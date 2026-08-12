#!/bin/bash
# Build script that ensures Pods are built before App

set -e

export LANG=en_US.UTF-8
cd "$(dirname "$0")"

echo "🔨 Building Pods first..."
xcodebuild -workspace App.xcworkspace \
  -scheme Pods-App \
  -configuration Debug \
  -sdk iphonesimulator \
  CODE_SIGN_IDENTITY="" \
  CODE_SIGNING_REQUIRED=NO \
  clean build \
  > /dev/null 2>&1

echo "✅ Pods built successfully"
echo ""
echo "🔨 Now building App..."
xcodebuild -workspace App.xcworkspace \
  -scheme App \
  -configuration Debug \
  -sdk iphonesimulator \
  CODE_SIGN_IDENTITY="" \
  CODE_SIGNING_REQUIRED=NO \
  build

echo ""
echo "✅ Build complete! You can now run the app in Xcode."
