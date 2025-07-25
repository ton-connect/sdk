# 🛠️ Working with Localhost in TON Connect

When developing a TON Connect-compatible app locally, it's important to understand how to handle the app **manifest** and wallet compatibility. This guide outlines how to configure your app for local development, with examples and workarounds for current limitations.

---

## 🚫 Localhost Limitation

TON Connect requires the **app manifest to be publicly accessible via HTTPS**, as specified in the protocol spec. This means:

- You **cannot use `localhost`, `127.0.0.1`, or private IPs** directly in manifest links.
- Wallets (especially browser extensions) may **fail to resolve or connect** when a manifest is hosted on `localhost`.
---

## ✅ Public Manifest Requirement

The app manifest must be **available over the public internet** via HTTPS. All URLs in the manifest (like `url`, `icons`, etc.) must also be publicly accessible.

### ❌ Not allowed:
```json
"url": "http://localhost:3000",
"icons": ["http://localhost:3000/icon.png"]
```

### ✅ Allowed (hosted on public domain or static host like GitHub Pages, Vercel, Netlify, etc.):
```json
"url": "https://my-ton-app.dev",
"icons": ["https://my-ton-app.dev/icon.png"]
```

---

## 📄 Example Manifest (demo-dapp-with-react-ui)

Here’s a working [example of a tonconnect-manifest.json](https://ton-connect.github.io/demo-dapp-with-react-ui/tonconnect-manifest.json
):

```json
{
  "url": "https://ton-connect.github.io/demo-dapp-with-react-ui/",
  "name": "Demo Dapp with React UI",
  "iconUrl": "https://ton-connect.github.io/demo-dapp-with-react-ui/apple-touch-icon.png",
  "termsOfUseUrl": "https://ton-connect.github.io/demo-dapp-with-react-ui/terms-of-use.txt",
  "privacyPolicyUrl": "https://ton-connect.github.io/demo-dapp-with-react-ui/privacy-policy.txt"
}
```

### Field Descriptions

| Field               | Description |
|--------------------|-------------|
| `url`              | The public URL where your dApp is hosted. |
| `name`             | Human-readable name for the app. |
| `iconUrl`          | Public link to the app icon (used by wallets). |
| `termsOfUseUrl`    | Optional, link to Terms of Use. |
| `privacyPolicyUrl` | Optional, link to Privacy Policy. |

> ⚠️ All URLs in the manifest **must be accessible from the public internet**. No local paths or proxies like `ngrok` are allowed for app-to-wallet communication via the manifest.

---

## 🧪 How to Test Locally (React UI Example)

While your app may be running on `localhost`, you still need a public manifest:

1. **Deploy the manifest JSON** to a public service (e.g. GitHub Pages, Vercel, Netlify).
2. **Hardcode the public manifest URL** when initializing `TonConnectUI`.

```ts
const connector = new TonConnectUI({
  manifestUrl: "https://my-ton-app.dev/tonconnect-manifest.json"
});
```

> ✅ Your `localhost` app will still function if the manifest is accessible and the wallet supports it.

---

## ⚙️ Special Case: Using Telegram Mini App

If you're developing for Telegram Mini App, using **`ngrok` is allowed** as a workaround to expose `localhost`. This is necessary because Telegram Mini App must resolve the full public URL, including manifests and APIs.

**Steps:**
1. Run `ngrok` or similar tunnel:
   ```bash
   ngrok http 3000
   ```
2. Replace local URLs in the manifest and app code with the ngrok URL.

---

## 🧩 Special Case: Browser Extensions Wallets

If you want to test locally with full wallet compatibility(include browser extensions), here is a working solution:

### 🔐 Step-by-step:

1. **Generate and install locally signed certificates**:
   ```bash
   brew install mkcert
   mkcert -install
   mkcert app-dev.dev
   ```

2. **Update your `/etc/hosts` file**:
   ```
   127.0.0.1 app-dev.dev
   ```

3. **Configure Vite dev server** in `vite.config.ts`:
   ```ts
   import { defineConfig } from 'vite';
   import fs from 'fs';

   export default defineConfig({
     server: {
       host: '0.0.0.0',
       https: {
         key: fs.readFileSync('./app-dev.dev-key.pem'),
         cert: fs.readFileSync('./app-dev.dev.pem'),
       }
     }
   });
   ```

4. **Serve your app on `https://app-dev.dev:5173`**

5. **Host the manifest JSON publicly** (example):
   ```
   https://app.stage.demo-dapp.dev/ton-connect.local-dev.json
   ```

6. **Use the public manifest in the connector**:
   ```ts
   const connector = new TonConnectUI({
     manifestUrl: "https://app.stage.demo-dapp.dev/ton-connect.local-dev.json"
   });
   ```

> ✅ This setup allows full local development with secure context and works with **any wallet**, including browser extensions.
