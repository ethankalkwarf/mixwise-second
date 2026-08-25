# App Store assets

Screenshots for App Store Connect (iPhone).

| File | Screen |
|------|--------|
| `00-welcome-intro.png` | Native intro (captured from Simulator — true device chrome) |
| `01-home.png` | Home hub + tab bar |
| `02-browse.png` | Search / collections |
| `03-recipe.png` | Recipe detail (Negroni) |
| `04-mix.png` | Mix / what you can pour |
| `05-you.png` | You / saved hub |
| `06-auth-apple-google.png` | Sign in with Apple + Google |

## Notes

- `01`–`06` were captured from production with the native shell (`MixWiseNative` UA + `?mixwise_app=1`) at iPhone viewport size. They match the in-app UI and tab bar.
- For **final** ASC upload, re-capture `01`–`06` once from a **TestFlight / Simulator** build after dismissing the intro (Cmd+S in Simulator, or Device → Screenshot). Apple prefers frames with the real status bar / home indicator.
- `00-welcome-intro.png` is already a full Simulator capture (1179×2556) and is fine to use as-is.
- **Preview video:** not generated here — record 15–30s on device (Home → recipe → Mix) in QuickTime or ASC’s preview tool.

## Suggested ASC order

1. Home (`01`)
2. Recipe (`03`)
3. Mix (`04`)
4. Browse (`02`)
5. You or Auth (`05` / `06`)
6. Optional: Welcome intro (`00`)
