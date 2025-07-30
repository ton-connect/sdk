# TON Connect UI React

TonConnect UI React is a React UI kit for TonConnect SDK. Use it to connect your app to TON wallets via TonConnect protocol in React apps.

If you don't use React for your app, take a look at [TonConnect UI](https://github.com/ton-connect/sdk/tree/main/packages/ui).

If you want to use TonConnect on the server side, you should use the [TonConnect SDK](https://github.com/ton-connect/sdk/tree/main/packages/sdk).

You can find more details and the protocol specification in the [docs](https://docs.ton.org/develop/dapps/ton-connect/overview).

---

# Getting started

[Latest API documentation](https://ton-connect.github.io/sdk/modules/_tonconnect_ui_react.html)

# Getting started

## Installation with npm
`npm i @tonconnect/ui-react`

# Usage

## Add TonConnectUIProvider
Add TonConnectUIProvider to the root of the app. You can specify UI options using props.
[See all available options](https://ton-connect.github.io/sdk/types/_tonconnect_ui_react.TonConnectUIProviderProps.html)

All TonConnect UI hooks calls and `<TonConnectButton />` component must be placed inside `<TonConnectUIProvider>`.

```tsx
import { TonConnectUIProvider } from '@tonconnect/ui-react';

export function App() {
    return (
        <TonConnectUIProvider manifestUrl="https://<YOUR_APP_URL>/tonconnect-manifest.json">
            { /* Your app */ }
        </TonConnectUIProvider>
    );
}

```
### Using with Next.js

`TonConnectUIProvider` relies on browser APIs and should be rendered only on the client side. In a Next.js application mark the component that wraps the provider with `"use client"` or dynamically import the provider to disable server side rendering.

Example for the `app` router:

```tsx
// app/providers.tsx
'use client';

import { TonConnectUIProvider } from '@tonconnect/ui-react';

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <TonConnectUIProvider manifestUrl="https://<YOUR_APP_URL>/tonconnect-manifest.json">
            {children}
        </TonConnectUIProvider>
    );
}
```

For the `pages` router you can dynamically import the provider:

```tsx
import dynamic from 'next/dynamic';

const TonConnectUIProvider = dynamic(
    () => import('@tonconnect/ui-react').then(m => m.TonConnectUIProvider),
    { ssr: false }
);

function MyApp({ Component, pageProps }) {
    return (
        <TonConnectUIProvider manifestUrl="https://<YOUR_APP_URL>/tonconnect-manifest.json"> 
            <Component {...pageProps} />
        </TonConnectUIProvider>
    );
}
```

With both approaches the provider is executed only in the browser and works correctly.


You can also specify required wallet features to filter wallets that will be displayed in the connect wallet modal:

```tsx
<TonConnectUIProvider
    manifestUrl="https://<YOUR_APP_URL>/tonconnect-manifest.json"
    walletsRequiredFeatures={{
        sendTransaction: {
            minMessages: 2, // Wallet must support at least 2 messages
            extraCurrencyRequired: true // Wallet must support extra currency
        }
    }}
>
    { /* Your app */ }
</TonConnectUIProvider>
```

This will only display wallets that support sending at least 2 messages and support extra currencies in transactions.

You can also specify preferred wallet features to prioritize wallets that will be displayed first in the connect wallet modal, without excluding others:

```tsx
<TonConnectUIProvider
    manifestUrl="https://<YOUR_APP_URL>/tonconnect-manifest.json"
    walletsPreferredFeatures={{
        sendTransaction: {
            minMessages: 2, // Wallets supporting at least 2 messages are prioritized
            extraCurrencyRequired: true // Wallets supporting extra currency are prioritized
        }
    }}
>
    { /* Your app */ }
</TonConnectUIProvider>
```

This will gently recommend wallets with richer functionality by placing them higher in the list, but all wallets remain available for selection.

## Add TonConnect Button
TonConnect Button is universal UI component for initializing connection. After wallet is connected it transforms to a wallet menu.
It is recommended to place it in the top right corner of your app.

```tsx
export const Header = () => {
    return (
        <header>
            <span>My App with React UI</span>
            <TonConnectButton />
        </header>
    );
};

```

You can add `className` and `style` props to the button as well. Note that you cannot pass child to the TonConnectButton. 
`<TonConnectButton  className="my-button-class" style={{ float: "right" }}/>`

## Use TonConnect UI hooks

### useTonAddress
Use it to get user's current ton wallet address. Pass boolean parameter isUserFriendly to choose format of the address. If wallet is not connected hook will return empty string.

```tsx
import { useTonAddress } from '@tonconnect/ui-react';

export const Address = () => {
    const userFriendlyAddress = useTonAddress();
    const rawAddress = useTonAddress(false);

    return (
        address && (
            <div>
                <span>User-friendly address: {userFriendlyAddress}</span>
                <span>Raw address: {rawAddress}</span>
            </div>
        )
    );
};
```

### useTonWallet
Use it to get user's current ton wallet. If wallet is not connected hook will return null.

See all wallet's properties

[Wallet interface](https://ton-connect.github.io/sdk/interfaces/_tonconnect_sdk.Wallet.html)
[WalletInfo interface](https://ton-connect.github.io/sdk/types/_tonconnect_sdk.WalletInfo.html)

```tsx
import { useTonWallet } from '@tonconnect/ui-react';

export const Wallet = () => {
    const wallet = useTonWallet();

    return (
        wallet && (
            <div>
                <span>Connected wallet: {wallet.name}</span>
                <span>Device: {wallet.device.appName}</span>
            </div>
        )
    );
};
```

### useTonConnectModal

Use this hook to access the functions for opening and closing the modal window. The hook returns an object with the current modal state and methods to open and close the modal.

```tsx
import { useTonConnectModal } from '@tonconnect/ui-react';

export const ModalControl = () => {
    const { state, open, close } = useTonConnectModal();

    return (
      <div>
          <div>Modal state: {state?.status}</div>
          <button onClick={open}>Open modal</button>
          <button onClick={close}>Close modal</button>
      </div>
    );
};
```

### useTonConnectUI
Use it to get access to the `TonConnectUI` instance and UI options updating function.

[See more about TonConnectUI instance methods](https://github.com/ton-connect/sdk/tree/main/packages/ui#send-transaction)

[See more about setOptions function](https://github.com/ton-connect/sdk/tree/main/packages/ui#change-options-if-needed)


```tsx
import { Locales, useTonConnectUI } from '@tonconnect/ui-react';

export const Settings = () => {
    const [tonConnectUI, setOptions] = useTonConnectUI();

    const onLanguageChange = (lang: string) => {
        setOptions({ language: lang as Locales });
    };

    const myTransaction = {
        validUntil: Math.floor(Date.now() / 1000) + 60, // 60 sec
        messages: [
            {
                address: "EQBBJBB3HagsujBqVfqeDUPJ0kXjgTPLWPFFffuNXNiJL0aA",
                amount: "20000000",
                // stateInit: "base64bocblahblahblah==" // just for instance. Replace with your transaction initState or remove
            },
            {
                address: "EQDmnxDMhId6v1Ofg_h5KR5coWlFG6e86Ro3pc7Tq4CA0-Jn",
                amount: "60000000",
                // payload: "base64bocblahblahblah==" // just for instance. Replace with your transaction payload or remove
            }
        ]
    }

    // Example with extra currency support
    const transactionWithExtraCurrency = {
        validUntil: Math.floor(Date.now() / 1000) + 60,
        messages: [
            {
                address: "EQBBJBB3HagsujBqVfqeDUPJ0kXjgTPLWPFFffuNXNiJL0aA",
                // Specify the extra currency
                extraCurrency: {
                    100: "10000000"
                }
            }
        ]
    }

    return (
        <div>
            <button onClick={() => tonConnectUI.sendTransaction(myTransaction)}>
                Send transaction
            </button>

            <div>
                <label>language</label>
                <select onChange={e => onLanguageChange(e.target.value)}>
                    <option value="en">en</option>
                    <option value="ru">ru</option>
                </select>
            </div>
        </div>
    );
};
```

## Sign data

Sign arbitrary data with the user's wallet. The wallet will display the data to the user for confirmation before signing. Wallet must be connected when you call `signData`, otherwise an error will be thrown.

### Data Types

You can sign three types of data. Choose the right format based on your use case:

- **Text** - Use for human-readable text that users should see and understand
- **Cell** - Use for TON Blockchain data that should be used in smart contracts (wallet may show unknown content warning)  
- **Binary** - For other arbitrary data (least preferred due to security warnings)

#### Text Format

Use when you need to sign human-readable text. The wallet displays the text to the user.

**Parameters:**
- `type` (string, required): Must be `"text"`
- `text` (string, required): UTF-8 text to sign
- `network` (string, optional): `"-239"` for mainnet, `"-3"` for testnet
- `from` (string, optional): Signer address in raw format `"0:<hex>"`

```tsx
import { useTonConnectUI } from '@tonconnect/ui-react';

export const SignTextData = () => {
    const [tonConnectUI] = useTonConnectUI();

    const handleSignText = async () => {
        const textData = {
            type: "text",
            text: "Confirm new 2fa number:\n+1 234 567 8901",
            network: "-239", // MAINNET = '-239', TESTNET = '-3'
            from: "0:348bcf827469c5fc38541c77fdd91d4e347eac200f6f2d9fd62dc08885f0415f"
        };

        try {
            const result = await tonConnectUI.signData(textData);
            console.log('Signed:', result);
        } catch (e) {
            console.error('Error:', e);
        }
    };

    return <button onClick={handleSignText}>Sign Text Data</button>;
};
```

#### Binary Format

Use for arbitrary binary data. The wallet shows a warning about unknown content.

**Parameters:**
- `type` (string, required): Must be `"binary"`
- `bytes` (string, required): Base64 encoded binary data (not url-safe)
- `network` (string, optional): `"-239"` for mainnet, `"-3"` for testnet
- `from` (string, optional): Signer address in raw format `"0:<hex>"`

```tsx
import { useTonConnectUI } from '@tonconnect/ui-react';

export const SignBinaryData = () => {
    const [tonConnectUI] = useTonConnectUI();

    const handleSignBinary = async () => {
        const binaryData = {
            type: "binary",
            bytes: "1Z/SGh+3HFMKlVHSkN91DpcCzT4C5jzHT3sA/24C5A==",
            network: "-239", // MAINNET = '-239', TESTNET = '-3'
            from: "0:348bcf827469c5fc38541c77fdd91d4e347eac200f6f2d9fd62dc08885f0415f"
        };

        try {
            const result = await tonConnectUI.signData(binaryData);
            console.log('Signed:', result);
        } catch (e) {
            console.error('Error:', e);
        }
    };

    return <button onClick={handleSignBinary}>Sign Binary Data</button>;
};
```

#### Cell Format

Use for TON Blockchain data with TL-B schema. The wallet can parse and display the content if the schema is valid.

**Parameters:**
- `type` (string, required): Must be `"cell"`
- `schema` (string, required): TL-B schema of the cell payload
- `cell` (string, required): Base64 encoded BoC (not url-safe) with single-root cell
- `network` (string, optional): `"-239"` for mainnet, `"-3"` for testnet
- `from` (string, optional): Signer address in raw format `"0:<hex>"`

```tsx
import { useTonConnectUI } from '@tonconnect/ui-react';

export const SignCellData = () => {
    const [tonConnectUI] = useTonConnectUI();

    const handleSignCell = async () => {
        const cellData = {
            type: "cell",
            schema: "transfer#0f8a7ea5 query_id:uint64 amount:(VarUInteger 16) destination:MsgAddress response_destination:MsgAddress custom_payload:(Maybe ^Cell) forward_ton_amount:(VarUInteger 16) forward_payload:(Either Cell ^Cell) = InternalMsgBody;",
            cell: "te6ccgEBAQEAVwAAqg+KfqVUbeTvKqB4h0AcnDgIAZucsOi6TLrfP6FcuPKEeTI6oB3fF/NBjyqtdov/KtutACCLqvfmyV9kH+Pyo5lcsrJzJDzjBJK6fd+ZnbFQe4+XggI=",
            network: "-239", // MAINNET = '-239', TESTNET = '-3'
            from: "0:348bcf827469c5fc38541c77fdd91d4e347eac200f6f2d9fd62dc08885f0415f"
        };

        try {
            const result = await tonConnectUI.signData(cellData);
            console.log('Signed:', result);
        } catch (e) {
            console.error('Error:', e);
        }
    };

    return <button onClick={handleSignCell}>Sign Cell Data</button>;
};
```

### Response

All signData calls return the same response structure:

```ts
interface SignDataResult {
    signature: string; // Base64 encoded signature
    address: string;   // Wallet address in raw format
    timestamp: number; // UNIX timestamp in seconds (UTC)
    domain: string;    // App domain name 
    payload: object;   // Original payload from the request
}
```

### Signature Verification

After receiving the signed data, you need to verify the signature to ensure it's authentic and was signed by the claimed wallet address.

**For backend verification:** See [TypeScript verification example](https://github.com/ton-connect/demo-dapp-with-react-ui/blob/master/src/server/services/sign-data-service.ts#L32-L109) showing how to verify signatures on your server.

**For smart contract verification:** See [FunC verification example](https://github.com/p0lunin/sign-data-contract-verify-example/blob/master/contracts/sign_data_example.fc) showing how to verify signatures in TON smart contracts.

**For complete technical details:** See the [Sign Data specification](https://github.com/ton-blockchain/ton-connect/blob/main/requests-responses.md#sign-data) for full signature verification requirements.

### useIsConnectionRestored
Indicates current status of the connection restoring process.
You can use it to detect when connection restoring process if finished.

```tsx
import { useIsConnectionRestored } from '@tonconnect/ui-react';

export const EntrypointPage = () => {
    const connectionRestored = useIsConnectionRestored();

    if (!connectionRestored) {
        return <Loader>Please wait...</Loader>;
    }

    return <MainPage />;
};
```

## Add connect request parameters (ton_proof)
Use `tonConnectUI.setConnectRequestParameters` function to pass your connect request parameters.

This function takes one parameter:

Set state to 'loading' while you are waiting for the response from your backend. If user opens connect wallet modal at this moment, he will see a loader.
```ts
const [tonConnectUI] = useTonConnectUI();

tonConnectUI.setConnectRequestParameters({
    state: 'loading'
});
```

or

Set state to 'ready' and define `tonProof` value. Passed parameter will be applied to the connect request (QR and universal link).
```ts
const [tonConnectUI] = useTonConnectUI();

tonConnectUI.setConnectRequestParameters({
    state: 'ready',
    value: {
        tonProof: '<your-proof-payload>'
    }
});
```

or

Remove loader if it was enabled via `state: 'loading'` (e.g. you received an error instead of a response from your backend). Connect request will be created without any additional parameters.
```ts
const [tonConnectUI] = useTonConnectUI();

tonConnectUI.setConnectRequestParameters(null);
```


You can call `tonConnectUI.setConnectRequestParameters` multiple times if your tonProof payload has bounded lifetime (e.g. you can refresh connect request parameters every 10 minutes).


```ts
const [tonConnectUI] = useTonConnectUI();

// enable ui loader
tonConnectUI.setConnectRequestParameters({ state: 'loading' });

// fetch you tonProofPayload from the backend
const tonProofPayload: string | null = await fetchTonProofPayloadFromBackend();

if (!tonProofPayload) {
    // remove loader, connect request will be without any additional parameters
    tonConnectUI.setConnectRequestParameters(null);
} else {
    // add tonProof to the connect request
    tonConnectUI.setConnectRequestParameters({
        state: "ready",
        value: { tonProof: tonProofPayload }
    });
}

```


You can find `ton_proof` result in the `wallet` object when wallet will be connected:

```ts
import {useTonConnectUI} from "@tonconnect/ui-react";

const [tonConnectUI] = useTonConnectUI();

useEffect(() =>
    tonConnectUI.onStatusChange(wallet => {
        if (wallet.connectItems?.tonProof && 'proof' in wallet.connectItems.tonProof) {
            checkProofInYourBackend(wallet.connectItems.tonProof.proof, wallet.account);
        }
    }), []);
```

# Troubleshooting

## Android Back Handler

If you encounter any issues with the Android back handler, such as modals not closing properly when the back button is pressed, or conflicts with `history.pushState()` if you are manually handling browser history in your application, you can disable the back handler by setting `enableAndroidBackHandler` to `false`:

```tsx
import { TonConnectUIProvider } from '@tonconnect/ui-react';

export function App() {
    return (
        <TonConnectUIProvider 
          manifestUrl="https://<YOUR_APP_URL>/tonconnect-manifest.json"
          enableAndroidBackHandler={false}
        >
            { /* Your app */ }
        </TonConnectUIProvider>
    );
}
```

This will disable the custom back button behavior on Android, and you can then handle the back button press manually in your application.

While we do not foresee any problems arising with the Android back handler, but if you find yourself needing to disable it due to an issue, please describe the problem in on [GitHub Issues](https://github.com/ton-connect/sdk/issues), so we can assist you further.

## Animations not working

If you are experiencing issues with animations not working in your environment, it might be due to a lack of support for the Web Animations API. To resolve this issue, you can use the `web-animations-js` polyfill.

### Using npm

To install the polyfill, run the following command:

```shell
npm install web-animations-js
```

Then, import the polyfill in your project:

```typescript
import 'web-animations-js';
```

### Using CDN

Alternatively, you can include the polyfill via CDN by adding the following script tag to your HTML:

```html
<script src="https://www.unpkg.com/web-animations-js@latest/web-animations.min.js"></script>
```

Both methods will provide a fallback implementation of the Web Animations API and should resolve the animation issues you are facing.

## Warning about 'encoding' module in Next.js

If you are using Next.js and see a warning similar to the following:

```
 ⚠ ./node_modules/node-fetch/lib/index.js
Module not found: Can't resolve 'encoding' in '.../node_modules/node-fetch/lib'

Import trace for requested module:
./node_modules/node-fetch/lib/index.js
./node_modules/@tonconnect/isomorphic-fetch/index.mjs
./node_modules/@tonconnect/sdk/lib/esm/index.mjs
./node_modules/@tonconnect/ui/lib/esm/index.mjs
./node_modules/@tonconnect/ui-react/lib/esm/index.js
```

Please note that this is just a warning and should not affect the functionality of your application. If you wish to suppress the warning, you have two options:

1. (Recommended) Wait for us to remove the dependency on `@tonconnect/isomorphic-fetch` in future releases. This dependency will be removed when we drop support for Node.js versions below 18.

2. (Optional) Install the `encoding` package, to resolve the warning:
```shell
npm install encoding
```

## How to find a sent transaction on the blockchain

See the detailed guide: [Transaction-by-external-message](../../guidelines/transaction-by-external-message.md)

This guide explains how to find the corresponding transaction on the TON blockchain by the BOC of an external-in message.

