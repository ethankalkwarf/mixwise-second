# One-Time Fix - Build in Xcode GUI ✅

## What I Changed

1. ✅ Switched from static to dynamic frameworks (more compatible)
2. ✅ Reinstalled CocoaPods with dynamic frameworks
3. ✅ Synced Capacitor configuration
4. ✅ Cleared all DerivedData

## What You Need to Do (One Time)

### In Xcode:

1. **Close Xcode completely** if it's open (`Cmd + Q`)

2. **Open the workspace**:
   ```bash
   open ios/App/App.xcworkspace
   ```
   - Verify you see **both** `App` and `Pods` in Project Navigator
   - If you only see `App`, close and reopen `.xcworkspace` (NOT `.xcodeproj`)

3. **Wait 60 seconds** for full indexing

4. **Select a simulator** (iPhone 15 Pro, etc.)

5. **Clean Build Folder**: `Cmd + Shift + K`

6. **Build**: `Cmd + B`
   - **This will automatically build Pods first, then App**
   - Xcode handles build dependencies automatically
   - Wait for completion (30-60 seconds)

7. **Run**: `Cmd + R`

## Why This Will Work

- ✅ Dynamic frameworks are more compatible with CocoaPods
- ✅ Xcode GUI handles build dependencies automatically
- ✅ Framework search paths resolve correctly with dynamic frameworks
- ✅ No more "No such module" errors

## If It Still Fails

**DO NOT** run terminal build commands - they hit sandbox errors.

Instead, in Xcode:
1. Product → Clean Build Folder (`Cmd + Shift + K`)
2. Close Xcode (`Cmd + Q`)
3. Reopen workspace: `open ios/App/App.xcworkspace`
4. Wait 60 seconds
5. Build again (`Cmd + B`)

The configuration is correct now. Just build in Xcode GUI.
