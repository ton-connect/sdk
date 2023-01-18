# TON Connect UI React

⚠️ **API is work in progress right now. Don't use this package in production.**

TonConnect UI React is a React UI kit for TonConnect SDK. Use it to connect your app to TON wallets via TonConnect protocol in React apps.

If you don't use React for your app, take a look at [TonConnect UI](https://github.com/ton-connect/sdk/tree/main/packages/ui).

If you want to use TonConnect on the server side, you should use the [TonConnect SDK](https://github.com/ton-connect/sdk/tree/main/packages/sdk).

You can find more details and the protocol specification in the [docs](https://github.com/ton-connect/docs).

---

# Getting started

[Latest API documentation](https://ton-connect.github.io/sdk/modules/_tonconnect_ui-react.html)

# Getting started

## Installation with npm
`npm i @tonconnect/ui-react`

# Usage

## Add TonConnectUIProvider
Add TonConnectUIProvider to the root of the app. You can specify UI options using props.
[See all available options](TODO)

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

### useIsConnectionRestored
Indicates current status of the connection restoring process.
You can use it to detect when connection restoring process if finished.

```tsx
import { useIsConnectionRestored } from '@tonconnect/ui-react';

export const EntrypointPage = () => {
    const connectionRestoring = useIsConnectionRestored();

    if (connectionRestoring) {
        return <Loader>Please wait...</Loader>;
    }

    return <MainPage />;
};
```

## Add connect request parameters (ton_proof)
Pass `getConnectParameters` async function to the `TonConnectUIProvider`. This callback will be called after `connectWallet` method call or `Connect Button` click before wallets list render.

In other words, if `getConnectParameters` is passed, there will be following steps:
1. User clicks to the 'Connect Wallet' button, or `connectWallet` method is called
2. Wallets modal opens
3. Loader renders in the center of the modal
4. TonConnectUI calls `getConnectParameters` and waits while it resolves
5. Wallets list renders in the center of the modal

Note that there is no any caching for `getConnectParameters` -- every time wallets modal opens there will be the 5 steps above.

If you have to make a http-request to your backend it this case, it is better to do it after app initialization (if possible) and return (probably completed) promise from the `getConnectParameters` to reduce loading time for the user.

```tsx
const tonProofPayloadPromise = getTonProofFromYourBackend(); // will be executed during app initialization
                                                             // don't forget to manage to refetch payload from your backend if needed
<TonConnectUIProvider
    manifestUrl="https://<YOUR_APP_URL>/tonconnect-manifest.json"
    getConnectParameters={async () => {
        const tonProof = await tonProofPayloadPromise; // will be executed every time when wallets modal is opened. It is recommended to make an http-request in advance
        return {
            tonProof
        };
    }}
>
    { /* Your app */ }
</TonConnectUIProvider>
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

