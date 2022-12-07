import { ITonConnect } from '@tonconnect/sdk';
import { TonUiOptions } from 'src/models/ton-ui-options';

export type TonConnectUiOptions =
    | TonConnectUiOptionsWithConnector
    | TonConnectUiOptionsWithManifest;

export interface TonConnectUiOptionsWithManifest extends TonConnectUiOptionsBase {
    manifestUrl?: string;
}

export interface TonConnectUiOptionsWithConnector extends TonConnectUiOptionsBase {
    connector?: ITonConnect;
}

export interface TonConnectUiOptionsBase {
    uiOptions?: TonUiOptions;
    restoreConnection?: boolean;
    widgetRootId?: string;
    buttonRootId?: string;
}
