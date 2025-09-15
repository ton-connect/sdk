import { TonConnectUI } from '@tonconnect/ui-react';

export function changeManifestUrl(tonConnectUI: TonConnectUI, newUrl: string | undefined) {
    const tonConnect = tonConnectUI as unknown as {
        connector: { dappSettings: { manifestUrl: string | undefined } };
    };


    tonConnect.connector.dappSettings.manifestUrl = newUrl;
}
