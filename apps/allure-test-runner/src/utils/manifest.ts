import { TonConnectUI } from '@tonconnect/ui';

export function changeManifestUrl(tonConnectUI: TonConnectUI, newUrl: string | undefined) {
    (
        tonConnectUI.connector as unknown as { dappSettings: { manifestUrl: string | undefined } }
    ).dappSettings.manifestUrl = newUrl;
}
