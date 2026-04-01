# TMA Debug

Debug tool to verify TON Connect detects Telegram Mini App correctly regardless of library loading order (`telegram-web-app.js`, `@telegram-apps/sdk`, TON Connect).

## How to use

1. Open the app, pick a scenario
2. Wait for steps to complete, check the verdict and diagnostics
3. Tap **Connect Wallet** to verify the connection works

Test on different platforms:
- Telegram Mini App: [t.me/tc_twa_demo_bot/debug](https://t.me/tc_twa_demo_bot/debug)
- Telegram Browser: [tma-debug.vercel.app](https://tma-debug.vercel.app/)

To retest — close and reopen. Last scenario auto-restarts via `sessionStorage`.

## Scenarios

| Scenario | Description |
|----------|-------------|
| TC Only | No TMA libraries, only TON Connect |
| TWA → TC | `telegram-web-app.js` loads before TON Connect |
| TC → TWA | TON Connect loads before `telegram-web-app.js` |
| SDK → TC | `@telegram-apps/sdk` inits before TON Connect |
| TC → SDK | TON Connect loads before `@telegram-apps/sdk` |

## Diagnostics

After steps complete, the app shows:
- **Verdict** — pass or fail summary
- **TON Connect detection** — Mini App, Platform, TMA Version, Telegram Browser
- **Environment** — OS, Browser, User Agent, Mobile
- **Versions** — UI, SDK
- **URL hash** — initial vs current
- **SessionStorage** — `tapps/launchParams`, `__telegram__initParams`, `ton-connect-session_storage_launchParams`

## Development

```bash
npm run dev
```

For Telegram testing: expose via [ngrok](https://ngrok.com/) or [Caddy](https://caddyserver.com/) (reverse proxy with HTTPS), then register the URL as a Mini App in [BotFather](https://t.me/BotFather).

## Deployment

Production: [tma-debug.vercel.app](https://tma-debug.vercel.app/) and [t.me/tc_twa_demo_bot/debug](https://t.me/tc_twa_demo_bot/debug). Preview deploys are created automatically on each PR.
