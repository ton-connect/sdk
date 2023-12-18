import { WalletInfoDTO } from 'src/models/wallet/wallet-info';

export const FALLBACK_WALLETS_LIST: WalletInfoDTO[] = [
    {
        app_name: 'telegram-wallet',
        name: 'Wallet',
        image: 'https://wallet.tg/images/logo-288.png',
        about_url: 'https://wallet.tg/',
        universal_url: 'https://t.me/wallet?attach=wallet',
        bridge: [
            {
                type: 'sse',
                url: 'https://bridge.tonapi.io/bridge'
            }
        ],
        platforms: ['ios', 'android', 'macos', 'windows', 'linux']
    },
    {
        app_name: 'tonkeeper',
        name: 'Tonkeeper',
        image: 'https://tonkeeper.com/assets/tonconnect-icon.png',
        tondns: 'tonkeeper.ton',
        about_url: 'https://tonkeeper.com',
        universal_url: 'https://app.tonkeeper.com/ton-connect',
        deepLink: 'tonkeeper-tc://',
        bridge: [
            {
                type: 'sse',
                url: 'https://bridge.tonapi.io/bridge'
            },
            {
                type: 'js',
                key: 'tonkeeper'
            }
        ],
        platforms: ['ios', 'android', 'chrome', 'firefox', 'macos']
    },
    {
        app_name: 'openmask',
        name: 'OpenMask',
        image: 'https://raw.githubusercontent.com/OpenProduct/openmask-extension/main/public/openmask-logo-288.png',
        about_url: 'https://www.openmask.app/',
        bridge: [
            {
                type: 'js',
                key: 'openmask'
            }
        ],
        platforms: ['chrome']
    },
    {
        app_name: 'mytonwallet',
        name: 'MyTonWallet',
        image: 'https://mytonwallet.io/icon-256.png',
        about_url: 'https://mytonwallet.io',
        universal_url: 'https://connect.mytonwallet.org',
        bridge: [
            {
                type: 'js',
                key: 'mytonwallet'
            },
            {
                type: 'sse',
                url: 'https://tonconnectbridge.mytonwallet.org/bridge/'
            }
        ],
        platforms: ['chrome', 'windows', 'macos', 'linux']
    },
    {
        app_name: 'tonhub',
        name: 'Tonhub',
        image: 'https://tonhub.com/tonconnect_logo.png',
        about_url: 'https://tonhub.com',
        universal_url: 'https://tonhub.com/ton-connect',
        bridge: [
            {
                type: 'js',
                key: 'tonhub'
            },
            {
                type: 'sse',
                url: 'https://connect.tonhubapi.com/tonconnect'
            }
        ],
        platforms: ['ios', 'android']
    },
    {
        app_name: 'tonflow',
        name: 'TonFlow',
        image: 'https://tonflow.net/assets/images/tonflow_ico_192.png',
        about_url: 'https://tonflow.net',
        bridge: [
            {
                type: 'js',
                key: 'tonflow'
            }
        ],
        platforms: ['chrome']
    },
    {
        app_name: 'dewallet',
        name: 'DeWallet',
        image: 'https://app.delabwallet.com/logo_black.png',
        about_url: 'https://delabwallet.com',
        bridge: [
            {
                type: 'js',
                key: 'dewallet'
            }
        ],
        platforms: ['chrome']
    },
    {
        app_name: 'xtonwallet',
        name: 'XTONWallet',
        image: 'https://xtonwallet.com/assets/img/icon-256-back.png',
        about_url: 'https://xtonwallet.com',
        bridge: [
            {
                type: 'js',
                key: 'xtonwallet'
            }
        ],
        platforms: ['chrome', 'firefox']
    },
    {
        app_name: 'tonwallet',
        name: 'TON Wallet',
        image: 'https://wallet.ton.org/assets/ui/qr-logo.png',
        about_url:
            'https://chrome.google.com/webstore/detail/ton-wallet/nphplpgoakhhjchkkhmiggakijnkhfnd',
        bridge: [
            {
                type: 'js',
                key: 'tonwallet'
            }
        ],
        platforms: ['chrome']
    }
];
