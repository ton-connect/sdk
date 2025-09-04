import { TonConnectUI } from '@tonconnect/ui';

export function changeManifestUrl(tonConnectUI: TonConnectUI, newUrl: string | undefined) {
    const val = tonConnectUI as unknown as {
        connector: { dappSettings: { manifestUrl: string | undefined } };
    };

    // TODO: not working
    console.log(`Changing manifest url to ${newUrl}`, val.connector);
    console.log(val.connector.dappSettings.manifestUrl);

    val.connector.dappSettings.manifestUrl = newUrl;

    console.log(val.connector.dappSettings.manifestUrl);
    console.log(`Changed manifest url to ${newUrl}`, val.connector);
    console.log(val.connector.dappSettings.manifestUrl);
}
