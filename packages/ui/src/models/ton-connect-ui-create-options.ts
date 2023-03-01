import { ITonConnect, ConnectAdditionalRequest } from '@tonconnect/sdk';
import { TonConnectUiOptions } from 'src/models/ton-connect-ui-options';

export type TonConnectUiCreateOptions =
    | TonConnectUiOptionsWithConnector
    | TonConnectUiOptionsWithManifest;

export interface TonConnectUiOptionsWithManifest extends TonConnectUiCreateOptionsBase {
    /**
     * Url to the [manifest]{@link https://github.com/ton-connect/docs/blob/main/requests-responses.md#app-manifest} with the Dapp metadata that will be displayed in the user's wallet.
     * If not passed, manifest from `${window.location.origin}/tonconnect-manifest.json` will be taken.
     */
    manifestUrl?: string;
}

export interface TonConnectUiOptionsWithConnector extends TonConnectUiCreateOptionsBase {
    /**
     * TonConnect instance. Can be helpful if you use custom ITonConnect implementation, or use both of @tonconnect/sdk and @tonconnect/ui in your app.
     */
    connector?: ITonConnect;
}

export interface TonConnectUiCreateOptionsBase extends TonConnectUiOptions {
    /**
     * Try to restore existing session and reconnect to the corresponding wallet.
     * @default true.
     */
    restoreConnection?: boolean;

    /**
     * HTML element id to attach the modal window element. If not passed, `div#tc-widget-root` in the end of the <body> will be added and used.
     * @default `div#tc-widget-root`.
     */
    widgetRootId?: string;

    /**
     * Use it to customize ConnectRequest and add `tonProof` payload.
     * The function will be called after wallets modal opens, and wallets selection will be blocked until it's resolved.
     * If you have to make a http-request to your backend, it is better to do it after app initialization (if possible) and return (probably completed) promise to reduce loading time for the user.
     */
    getConnectParameters?: () => Promise<ConnectAdditionalRequest>;
}
