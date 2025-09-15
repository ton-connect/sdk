import { TonConnectUI } from '@tonconnect/ui-react';

export function changeManifestUrl(tonConnectUI: TonConnectUI, newUrl: string | undefined) {
    const tonConnect = tonConnectUI as unknown as {
        connector: { dappSettings: { manifestUrl: string | undefined } };
    };

    console.debug(`Changing manifest url to ${newUrl}`);

    tonConnect.connector.dappSettings.manifestUrl = newUrl;
}
