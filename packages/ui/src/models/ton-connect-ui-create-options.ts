import { ITonConnect } from '@tonconnect/sdk';
import { TonConnectUiOptions } from 'src/models/ton-connect-ui-options';

export type TonConnectUiCreateOptions =
    | TonConnectUiOptionsWithConnector
    | TonConnectUiOptionsWithManifest;

export interface TonConnectUiOptionsWithManifest extends TonConnectUiCreateOptionsBase {
    manifestUrl?: string;
}

export interface TonConnectUiOptionsWithConnector extends TonConnectUiCreateOptionsBase {
    connector?: ITonConnect;
}

export interface TonConnectUiCreateOptionsBase extends TonConnectUiOptions {
    restoreConnection?: boolean;
    widgetRootId?: string;
}
