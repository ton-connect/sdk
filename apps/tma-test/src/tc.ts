import { TonConnectUI } from '@tonconnect/ui';

export function initTC(): TonConnectUI {
    return new TonConnectUI({
        manifestUrl: new URL('/tonconnect-manifest.json', location.origin).toString(),
        buttonRootId: 'button-root'
    });
}
