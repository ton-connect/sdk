---
'@tonconnect/ui': minor
---

Let dApps drive the post-send wallet redirect for embedded requests

In the embedded-request fallback flow (`onConnected` in `sendTransaction`,
`signData`, and `signMessage`), the SDK no longer auto-opens the wallet after
the bridge accepts the request. The page's transient user activation is
typically gone by that point — the connect step consumed it — and the
SDK-initiated `window.open` ends up landing the user on a web page instead of
the wallet app (most visibly on Chrome for Android).

The `send` callback now accepts the same options as `sendTransaction` /
`signData` / `signMessage` (without `onConnected`). Any field passed overrides
the outer call for that dispatch. Wire `onRequestSent` to a custom "Open
wallet" button so the redirect runs inside a fresh user gesture:

```ts
tonConnectUi.sendTransaction(tx, {
    onConnected: (send, { dispatched }) => {
        if (dispatched && !confirm('Send twice?')) throw new Error('cancelled');
        return send({
            onRequestSent: redirectToWallet => setOpenWallet(() => redirectToWallet)
        });
    }
});

// elsewhere in the UI
{openWallet && <button onClick={openWallet}>Open wallet</button>}
```

The already-connected `sendTransaction`/`signData`/`signMessage` bridge flow is
unchanged — it still auto-redirects.
