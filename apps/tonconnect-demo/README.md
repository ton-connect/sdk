# TonConnect Demo

A demo application for testing and demonstrating TonConnect wallet integration features.

## Features

- **Transaction**: Send transactions with customizable parameters
- **Sign Data**: Test data signing capabilities (text, cell, binary)
- **Subscription**: Manage wallet subscriptions
- **Ton Proof**: Authenticate using TON Proof
- **Settings**: Configure TonConnect UI appearance and behavior

## Getting Started

```bash
# Install dependencies
pnpm install

# Start development server
pnpm dev --filter tonconnect-demo

# Build for production
VITE_APP_URL=https://your-domain.com pnpm build --filter tonconnect-demo
```

## Deployment

The `tonconnect-manifest.json` is generated at build time based on the `VITE_APP_URL` environment variable.

```bash
# Local build
VITE_APP_URL=https://your-domain.com pnpm build --filter tonconnect-demo

# Or set in CI/CD environment variables (Vercel, GitHub Actions, etc.)
```

If `VITE_APP_URL` is not set, it defaults to `http://localhost:5173`.

## DevTools

The demo includes hidden developer tools for testing and debugging.

### How to Activate

1. Click on the "TonConnect Demo" title **5 times quickly** (within 2 seconds)
2. A toast notification will confirm "DevTools unlocked!"
3. A new "DevTools" tab will appear

### Available Features

#### QA Mode

Enables testing mode from `@tonconnect/sdk`:

- Disables strict validations (errors become console warnings)
- Allows cross-network transactions (e.g., mainnet tx when wallet is on testnet)
- Uses staging wallets list instead of production
- Shows injected wallets in the list

**Note**: Changing QA Mode requires a page reload to take full effect.

#### Mobile Console (Eruda)

Enables [Eruda](https://github.com/liriliri/eruda) - a mobile-friendly developer console:

- Console logs viewer
- Network requests inspector
- DOM elements explorer
- Storage viewer (localStorage, sessionStorage, cookies)

Useful for debugging on mobile devices where browser DevTools are not available.

### Hiding DevTools

Click "Lock DevTools" button in the DevTools tab to hide it again. You can always re-activate it using the secret tap.

## Tech Stack

- React 19
- TypeScript
- Vite
- Tailwind CSS
- shadcn/ui components
- MSW (Mock Service Worker) for API mocking
