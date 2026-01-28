---
id: manifestUrl
name: Manifest URL
summary: URL to your dApp manifest file for wallet identification
links:
  - title: TON Connect Manifest Documentation
    url: https://docs.ton.org/ecosystem/ton-connect/manifest
---

The manifest URL points to a JSON file that contains metadata about your dApp. Wallets use this information to identify and display your dApp to users.

## Required Fields

- **url** - Your dApp URL (used as unique identifier)
- **name** - Human-readable name shown in wallets
- **iconUrl** - URL to your dApp icon (PNG, 180x180 recommended)

## Optional Fields

- **termsOfUseUrl** - Link to your terms of service
- **privacyPolicyUrl** - Link to your privacy policy

## Example Manifest

```json
{
  "url": "https://your-app.com",
  "name": "My dApp",
  "iconUrl": "https://your-app.com/icon-180x180.png",
  "termsOfUseUrl": "https://your-app.com/terms",
  "privacyPolicyUrl": "https://your-app.com/privacy"
}
```

## Requirements

- The manifest must be publicly accessible via HTTPS
- The icon should be a square PNG image (180x180 pixels recommended)
- The URL in the manifest should match your dApp's actual URL
