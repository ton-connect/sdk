import { WalletInfoDTO } from 'src/models/wallet/wallet-info';

export const FALLBACK_WALLETS_LIST: WalletInfoDTO[] = [
    {
        name: 'Tonkeeper',
        image: 'https://tonkeeper.com/assets/tonconnect-icon.png',
        tondns: 'tonkeeper.ton',
        about_url: 'https://tonkeeper.com',
        universal_url: 'https://app.tonkeeper.com/ton-connect',
        bridge: [
            {
                type: 'sse',
                url: 'https://bridge.tonapi.io/bridge'
            },
            {
                type: 'js',
                key: 'tonkeeper'
            }
        ]
    },
    {
        name: 'OpenMask',
        image: 'https://raw.githubusercontent.com/OpenProduct/openmask-extension/main/public/openmask-logo-288.png',
        about_url: 'https://www.openmask.app/',
        bridge: [
            {
                type: 'js',
                key: 'openmask'
            }
        ]
    },
    {
        name: 'MyTonWallet',
        image: 'https://mytonwallet.io/icon-256.png',
        about_url: 'https://mytonwallet.io',
        bridge: [
            {
                type: 'js',
                key: 'mytonwallet'
            }
        ]
    }
];
