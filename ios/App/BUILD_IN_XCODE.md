# Build in Xcode - Final Steps ✅

## Critical Instructions

**DO NOT build from terminal** - use Xcode GUI only!

## Steps (In Order):

### 1. Open Workspace
```bash
open ios/App/App.xcworkspace
```
- You MUST see both `App` and `Pods` in Project Navigator
- If you only see `App`, you opened `.xcodeproj` - close and open `.xcworkspace`

### 2. Wait for Indexing
- Wait 30-60 seconds for Xcode to finish indexing
- Watch the progress bar at the top

### 3. Select Simulator
- Click device selector (top left, next to scheme)
- Choose iPhone 15 Pro or any simulator

### 4. Clean Build Folder
- Product → Clean Build Folder (`Cmd + Shift + K`)
- Wait for completion

### 5. Build in Xcode GUI
- Product → Build (`Cmd + B`)
- **DO NOT use terminal xcodebuild commands**
- Let Xcode handle everything automatically

### 6. Watch Build Log
- If you see "No such module 'Capacitor'" error:
  - Stop the build
  - Wait 10 seconds
  - Build again (`Cmd + B`)
  - Xcode should auto-build Pods first

### 7. If Build Succeeds
- Product → Run (`Cmd + R`)
- App launches in simulator ✅

## Why This Works

Xcode automatically:
1. Builds Pods dependencies first
2. Resolves framework search paths correctly
3. Handles sandbox permissions properly
4. Uses consistent DerivedData folder

## Troubleshooting

### If "No such module" error persists:

1. **Close Xcode completely** (Cmd + Q)

2. **Clear everything**:
   ```bash
   rm -rf ~/Library/Developer/Xcode/DerivedData/App-*
   ```

3. **Reopen workspace**:
   ```bash
   open ios/App/App.xcworkspace
   ```

4. **Wait 60 seconds** for full indexing

5. **Build again** (Cmd + B) in Xcode

### If build still fails:

1. **Check scheme**:
   - Scheme dropdown should show `App`
   - NOT `Pods-App` or `Capacitor`

2. **Verify workspace**:
   - Project Navigator shows `App` and `Pods`
   - Both should be expandable

3. **Build Pods manually first**:
   - Change scheme to `Pods-App`
   - Product → Build (Cmd + B)
   - Wait for success
   - Change scheme back to `App`
   - Product → Build (Cmd + B)

## Summary

**Build in Xcode GUI only** - terminal builds hit sandbox issues. Xcode automatically handles build order and dependencies when you use the GUI.
