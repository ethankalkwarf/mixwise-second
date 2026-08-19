# Build in Xcode

See **[docs/mobile-setup.md](../../docs/mobile-setup.md)** for the full guide.

## Quick steps

1. `npm run dev` (terminal 1)
2. `npm run mobile:dev` (terminal 2 — syncs LAN IP + opens Xcode)
3. Open **`App.xcworkspace`** (must show App + Pods)
4. Select iPhone simulator → Run (`Cmd+R`)

Build in the **Xcode GUI**, not terminal `xcodebuild`.

## If "No such module Capacitor"

1. Quit Xcode (`Cmd+Q`)
2. `rm -rf ~/Library/Developer/Xcode/DerivedData/App-*`
3. `cd ios/App && pod install && cd ../..`
4. `npm run mobile:sync:dev`
5. Reopen workspace, wait for indexing, Clean + Build

## Requirements

- **Xcode** (full app, not Command Line Tools only)
- **iOS 15+** deployment target
- CocoaPods (`pod install` runs automatically during `cap sync`)
