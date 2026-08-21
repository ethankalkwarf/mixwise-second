# MixWise iOS App

Capacitor shell around the MixWise web app. Native UI (tab bar, saved hub, notifications) runs inside a WebView.

## Architecture

| Mode | WebView loads | Use case |
|------|---------------|----------|
| **Development** | `http://<your-mac-ip>:3000` | Local iteration with hot reload |
| **Production** | `https://www.getmixwise.com` | TestFlight / App Store builds |

The app does **not** bundle a static Next.js export. Production builds point at the live site so auth, API routes, and SSR keep working.

## Quick start (development)

**Terminal 1 — web server**
```bash
npm run dev
```

**Terminal 2 — sync + open Xcode**
```bash
npm run mobile:dev
```

In Xcode:
1. Open `App.xcworkspace` (must show **App** and **Pods**)
2. Select an iPhone simulator
3. Product → Run (`Cmd+R`)

> Build in the **Xcode GUI**, not terminal `xcodebuild`, if you hit CocoaPods sandbox issues.

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run mobile:sync:dev` | Sync iOS project for local dev (auto-detects LAN IP) |
| `npm run mobile:sync:prod` | Sync for production URL (`getmixwise.com`) |
| `npm run mobile:dev` | Prepare + sync dev + open Xcode |
| `npm run mobile:open` | Open Xcode workspace |

## Native navigation

Five-tab shell designed for thumb reach and full site access:

| Tab | Purpose |
|-----|---------|
| **Home** | Personalized hub — ready-to-make drinks, explore cards, featured recipes |
| **Browse** | Full cocktail library (`/cocktails`) with cross-links to Learn & Ingredients |
| **Mix** | Cabinet / bar builder — add bottles, see what you can pour |
| **You** | Favorites, recent, my bar, shopping list, account |
| **More** | Sheet with Learn, Ingredients, Collections, Shopping list, Dashboard, auth |

Browse pages (recipes, learn, ingredients, collections) show a **horizontal chip bar** for quick switching without losing context.

## Native features

- **Tab bar**: Home, Browse, Mix, You, More
- **Saved hub**: Favorites, recent, bar, profile + notification settings
- **Plugins**: Status bar, splash screen, keyboard, share sheet, local notifications, preferences
- **Auth**: Google + Sign in with Apple via deep-link OAuth (`com.getmixwise.app://auth/callback`)

## After Xcode finishes installing

1. Open Xcode once and accept the license / install additional components.
2. Point the CLI at full Xcode (if needed):
   ```bash
   sudo xcode-select -s /Applications/Xcode.app/Contents/Developer
   ```
3. Install pods and sync:
   ```bash
   npm run dev          # terminal 1
   npm run mobile:dev   # terminal 2
   ```
4. In Xcode: simulator → Run (`Cmd+R`).

## Supabase auth (native app)

Google and Apple sign-in **must** return to the app via a deep link. If OAuth finishes in Safari on `getmixwise.com`, the session stays in the browser and the app stays logged out.

Add these redirect URLs in Supabase **Authentication → URL Configuration → Redirect URLs**:

```
com.getmixwise.app://auth/callback
https://www.getmixwise.com/auth/native-callback
https://getmixwise.com/auth/native-callback
https://mixwise-testflight.vercel.app/auth/native-callback
```

Native Google/Apple sign-in uses the **custom scheme** (`com.getmixwise.app://auth/callback`) as
`redirectTo` so `ASWebAuthenticationSession` can dismiss as soon as Google/Apple finishes. Keep the
HTTPS bridge URLs allowlisted too as a fallback path.

Without the custom scheme allowlisted, Supabase falls back to Site URL and Google login opens the
website instead of returning to the app.

### How native OAuth works

1. App opens Google/Apple via `ASWebAuthenticationSession` (`@capgo/capacitor-inappbrowser` `openSecureWindow`)
2. Supabase redirects to `com.getmixwise.app://auth/callback?code=…`
3. The auth sheet dismisses; the app exchanges the code and opens **Home**

Fallback (if the MixWise OAuth plugin isn’t in the binary yet): Capgo `openSecureWindow`, then an
in-app Capgo webview that watches for the callback. We never fall back to Capacitor Browser /
system Safari — that path logs the app in via deep link but leaves the user stranded in the sheet.

**Important:** Dismissing the auth sheet after a deep link requires the MixWise iOS plugin
(`MixWiseOAuthPlugin`). Ship a new TestFlight/App Store build after pulling these changes — a
web-only deploy is not enough for this fix.

Email magic links use the web callback (`https://www.getmixwise.com/auth/callback` or your LAN URL in
dev). The native app **hides** magic-link CTAs (Auth dialog, join panel, save-bar prompt) because those
links open Safari and cannot return the session to the WebView — native sign-in is Google, Apple, or
email + password.

## Supabase auth (dev web callback)

When testing magic links against your local dev server, add your LAN callback:

```
http://192.168.x.x:3000/auth/callback
```

Replace `x.x` with your Mac IP (`npm run mobile:sync:dev` auto-detects it). Production builds use `https://www.getmixwise.com/auth/callback`.

## App Store checklist (later)

1. `npm run mobile:sync:prod`
2. In Xcode: set signing team, bump version, Archive
3. Upload to App Store Connect

## Troubleshooting

**Blank white screen in simulator**
- Confirm `npm run dev` is running
- Re-run `npm run mobile:sync:dev` (IP may have changed)
- Check Xcode console for network errors

**"No such module Capacitor"**
- Open `.xcworkspace`, not `.xcodeproj`
- Product → Clean Build Folder, wait for indexing, build again
- See `ios/App/BUILD_IN_XCODE.md`

**Plugins not working after install**
```bash
cd ios/App && pod install && cd ../..
npm run mobile:sync:dev
```
