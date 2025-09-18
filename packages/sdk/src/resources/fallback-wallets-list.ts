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
                url: 'https://walletbot.me/tonconnect-bridge/bridge'
            }
        ],
        platforms: ['ios', 'android', 'macos', 'windows', 'linux'],
        features: [
            {
                name: 'SendTransaction',
                maxMessages: 255,
                extraCurrencySupported: true
            },
            {
                name: 'SignData',
                types: ['text', 'binary', 'cell']
            }
        ]
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
        platforms: ['ios', 'android', 'chrome', 'firefox', 'macos'],
        features: [
            {
                name: 'SendTransaction',
                maxMessages: 255,
                extraCurrencySupported: true
            },
            {
                name: 'SignData',
                types: ['text', 'binary', 'cell']
            }
        ]
    },
    {
        app_name: 'mytonwallet',
        name: 'MyTonWallet',
        image: 'https://static.mytonwallet.io/icon-256.png',
        about_url: 'https://mytonwallet.io',
        universal_url: 'https://connect.mytonwallet.org',
        deepLink: 'mytonwallet-tc://',
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
        platforms: ['chrome', 'windows', 'macos', 'linux', 'ios', 'android', 'firefox'],
        features: [
            {
                name: 'SendTransaction',
                maxMessages: 255,
                extraCurrencySupported: false
            },
            {
                name: 'SignData',
                types: ['text', 'binary', 'cell']
            }
        ]
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
        platforms: ['ios', 'android'],
        features: [
            {
                name: 'SendTransaction',
                maxMessages: 255,
                extraCurrencySupported: true
            },
            {
                name: 'SignData',
                types: ['text', 'binary', 'cell']
            }
        ]
    },
    {
        app_name: 'bitgetTonWallet',
        name: 'Bitget Wallet',
        image: 'https://raw.githubusercontent.com/bitgetwallet/download/refs/heads/main/logo/png/bitget_wallet_logo_288_mini.png',
        about_url: 'https://web3.bitget.com',
        deepLink: 'bitkeep://',
        bridge: [
            {
                type: 'js',
                key: 'bitgetTonWallet'
            },
            {
                type: 'sse',
                url: 'https://ton-connect-bridge.bgwapi.io/bridge'
            }
        ],
        platforms: ['ios', 'android', 'chrome'],
        universal_url: 'https://bkcode.vip/ton-connect',
        features: [
            {
                name: 'SendTransaction',
                maxMessages: 4,
                extraCurrencySupported: false
            }
        ]
    },
    {
        app_name: 'okxMiniWallet',
        name: 'OKX Mini Wallet',
        image: 'https://static.okx.com/cdn/assets/imgs/2411/8BE1A4A434D8F58A.png',
        about_url: 'https://www.okx.com/web3',
        universal_url: 'https://t.me/OKX_WALLET_BOT?attach=wallet',
        bridge: [
            {
                type: 'sse',
                url: 'https://www.okx.com/tonbridge/discover/rpc/bridge'
            }
        ],
        platforms: ['ios', 'android', 'macos', 'windows', 'linux'],
        features: [
            {
                name: 'SendTransaction',
                maxMessages: 4,
                extraCurrencySupported: false
            }
        ]
    },
    {
        app_name: 'binanceWeb3TonWallet',
        name: 'Binance Wallet',
        image: 'https://public.bnbstatic.com/static/binance-w3w/ton-provider/binancew3w.png',
        about_url: 'https://www.binance.com/en/web3wallet',
        deepLink: 'bnc://app.binance.com/cedefi/ton-connect',
        bridge: [
            {
                type: 'js',
                key: 'binancew3w'
            },
            {
                type: 'sse',
                url: 'https://wallet.binance.com/tonbridge/bridge'
            }
        ],
        platforms: ['ios', 'android', 'macos', 'windows', 'linux'],
        universal_url: 'https://app.binance.com/cedefi/ton-connect',
        features: [
            {
                name: 'SendTransaction',
                maxMessages: 4,
                extraCurrencySupported: false
            }
        ]
    },
    {
        app_name: 'fintopio-tg',
        name: 'Fintopio',
        image: 'https://raw.githubusercontent.com/fintopio/ton-pub/refs/heads/main/logos/tonconnect-icon.png',
        about_url: 'https://fintopio.com',
        universal_url: 'https://t.me/fintopio?attach=wallet',
        bridge: [
            {
                type: 'sse',
                url: 'https://wallet-bridge.fintopio.com/bridge'
            }
        ],
        platforms: ['ios', 'android', 'macos', 'windows', 'linux'],
        features: [
            {
                name: 'SendTransaction',
                maxMessages: 4,
                extraCurrencySupported: false
            }
        ]
    },
    {
        app_name: 'okxTonWallet',
        name: 'OKX Wallet',
        image: 'https://static.okx.com/cdn/assets/imgs/247/58E63FEA47A2B7D7.png',
        about_url: 'https://www.okx.com/web3',
        universal_url:
            'https://www.okx.com/download?appendQuery=true&deeplink=okx://web3/wallet/tonconnect',
        bridge: [
            {
                type: 'js',
                key: 'okxTonWallet'
            },
            {
                type: 'sse',
                url: 'https://www.okx.com/tonbridge/discover/rpc/bridge'
            }
        ],
        platforms: ['chrome', 'safari', 'firefox', 'ios', 'android'],
        features: [
            {
                name: 'SendTransaction',
                maxMessages: 4,
                extraCurrencySupported: false
            }
        ]
    },
    {
        app_name: 'hot',
        name: 'HOT',
        image: 'https://raw.githubusercontent.com/hot-dao/media/main/logo.png',
        about_url: 'https://hot-labs.org/',
        universal_url: 'https://t.me/herewalletbot?attach=wallet',
        bridge: [
            {
                type: 'sse',
                url: 'https://sse-bridge.hot-labs.org'
            },
            {
                type: 'js',
                key: 'hotWallet'
            }
        ],
        platforms: ['ios', 'android', 'macos', 'windows', 'linux'],
        features: [
            {
                name: 'SendTransaction',
                maxMessages: 4,
                extraCurrencySupported: false
            }
        ]
    },
    {
        app_name: 'bybitTonWallet',
        name: 'Bybit Wallet',
        image: 'https://raw.githubusercontent.com/bybit-web3/bybit-web3.github.io/main/docs/images/bybit-logo.png',
        about_url: 'https://www.bybit.com/web3',
        universal_url: 'https://app.bybit.com/ton-connect',
        deepLink: 'bybitapp://',
        bridge: [
            {
                type: 'js',
                key: 'bybitTonWallet'
            },
            {
                type: 'sse',
                url: 'https://api-node.bybit.com/spot/api/web3/bridge/ton/bridge'
            }
        ],
        platforms: ['ios', 'android', 'chrome'],
        features: [
            {
                name: 'SendTransaction',
                maxMessages: 4,
                extraCurrencySupported: false
            }
        ]
    },
    {
        app_name: 'dewallet',
        name: 'DeWallet',
        image: 'https://raw.githubusercontent.com/delab-team/manifests-images/main/WalletAvatar.png',
        about_url: 'https://delabwallet.com',
        universal_url: 'https://t.me/dewallet?attach=wallet',
        bridge: [
            {
                type: 'sse',
                url: 'https://bridge.dewallet.pro/bridge'
            }
        ],
        platforms: ['ios', 'android', 'macos', 'windows', 'linux'],
        features: [
            {
                name: 'SendTransaction',
                maxMessages: 4,
                extraCurrencySupported: false
            }
        ]
    },
    {
        app_name: 'safepalwallet',
        name: 'SafePal',
        image: 'https://s.pvcliping.com/web/public_image/SafePal_x288.png',
        tondns: '',
        about_url: 'https://www.safepal.com',
        universal_url: 'https://link.safepal.io/ton-connect',
        deepLink: 'safepal-tc://',
        bridge: [
            {
                type: 'sse',
                url: 'https://ton-bridge.safepal.com/tonbridge/v1/bridge'
            },
            {
                type: 'js',
                key: 'safepalwallet'
            }
        ],
        platforms: ['ios', 'android', 'chrome', 'firefox'],
        features: [
            {
                name: 'SendTransaction',
                maxMessages: 1,
                extraCurrencySupported: false
            }
        ]
    },
    {
        app_name: 'GateWallet',
        name: 'GateWallet',
        image: 'https://img.gatedataimg.com/prd-ordinal-imgs/036f07bb8730716e/gateio-0925.png',
        about_url: 'https://www.gate.io/',
        bridge: [
            {
                type: 'js',
                key: 'gatetonwallet'
            },
            {
                type: 'sse',
                url: 'https://dapp.gateio.services/tonbridge_api/bridge/v1'
            }
        ],
        platforms: ['ios', 'android'],
        universal_url:
            'https://gate.onelink.me/Hls0/web3?gate_web3_wallet_universal_type=ton_connect',
        features: [
            {
                name: 'SendTransaction',
                maxMessages: 4,
                extraCurrencySupported: false
            }
        ]
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
        platforms: ['chrome'],
        features: [
            {
                name: 'SendTransaction',
                maxMessages: 4,
                extraCurrencySupported: false
            }
        ]
    },
    {
        app_name: 'BitgetWeb3',
        name: 'BitgetWeb3',
        image: 'https://img.bitgetimg.com/image/third/1731638059795.png',
        about_url: '​https://www.bitget.com',
        universal_url: 'https://t.me/BitgetOfficialBot?attach=wallet',
        bridge: [
            {
                type: 'sse',
                url: 'https://ton-connect-bridge.bgwapi.io/bridge'
            }
        ],
        platforms: ['ios', 'android', 'windows', 'macos', 'linux'],
        features: [
            {
                name: 'SendTransaction',
                maxMessages: 4,
                extraCurrencySupported: false
            }
        ]
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
        platforms: ['chrome', 'firefox'],
        features: [
            {
                name: 'SendTransaction',
                maxMessages: 1,
                extraCurrencySupported: false
            }
        ]
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
        platforms: ['chrome'],
        features: [
            {
                name: 'SendTransaction',
                maxMessages: 4,
                extraCurrencySupported: false
            }
        ]
    },
    {
        app_name: 'bitgetWalletLite',
        name: 'Bitget Wallet Lite',
        image: 'https://raw.githubusercontent.com/bitgetwallet/download/refs/heads/main/logo/png/bitget_wallet_lite_logo_288.png',
        about_url: 'https://web3.bitget.com',
        universal_url: 'https://t.me/BitgetWallet_TGBot?attach=wallet',
        bridge: [
            {
                type: 'sse',
                url: 'https://ton-connect-bridge.bgwapi.io/bridge'
            }
        ],
        platforms: ['ios', 'android', 'macos', 'windows', 'linux'],
        features: [
            {
                name: 'SendTransaction',
                maxMessages: 255,
                extraCurrencySupported: false
            }
        ]
    },
    {
        app_name: 'tomoWallet',
        name: 'Tomo Wallet',
        image: 'https://pub.tomo.inc/logo.png',
        about_url: 'https://www.tomo.inc/',
        universal_url: 'https://t.me/tomowalletbot?attach=wallet',
        bridge: [
            {
                type: 'sse',
                url: 'https://go-bridge.tomo.inc/bridge'
            }
        ],
        platforms: ['ios', 'android', 'macos', 'windows', 'linux'],
        features: [
            {
                name: 'SendTransaction',
                maxMessages: 4,
                extraCurrencySupported: false
            }
        ]
    },
    {
        app_name: 'miraiapp-tg',
        name: 'Mirai Mini App',
        image: 'https://cdn.mirailabs.co/miraihub/miraiapp-tg-icon-288.png',
        about_url: 'https://mirai.app',
        universal_url: 'https://t.me/MiraiAppBot?attach=wallet',
        bridge: [
            {
                type: 'sse',
                url: 'https://bridge.mirai.app'
            }
        ],
        platforms: ['ios', 'android', 'macos', 'windows', 'linux'],
        features: [
            {
                name: 'SendTransaction',
                maxMessages: 255,
                extraCurrencySupported: false
            },
            {
                name: 'SignData',
                types: ['text', 'binary', 'cell']
            }
        ]
    },
    {
        app_name: 'Architec.ton',
        name: 'Architec.ton',
        image: 'https://raw.githubusercontent.com/Architec-Ton/wallet-tma/refs/heads/dev/public/images/arcwallet_logo.png',
        about_url: 'https://architecton.tech',
        universal_url: 'https://t.me/architec_ton_bot?attach=wallet',
        bridge: [
            {
                type: 'sse',
                url: 'https://tc.architecton.su/bridge'
            }
        ],
        platforms: ['ios', 'android', 'macos', 'windows', 'linux'],
        features: [
            {
                name: 'SendTransaction',
                maxMessages: 255,
                extraCurrencySupported: false
            }
        ]
    },
    {
        app_name: 'tokenpocket',
        name: 'TokenPocket',
        image: 'https://hk.tpstatic.net/logo/tokenpocket.png',
        about_url: 'https://www.tokenpocket.pro',
        universal_url: 'https://tp-lab.tptool.pro/ton-connect/',
        bridge: [
            {
                type: 'js',
                key: 'tokenpocket'
            },
            {
                type: 'sse',
                url: 'https://ton-connect.mytokenpocket.vip/bridge'
            }
        ],
        platforms: ['ios', 'android'],
        features: [
            {
                name: 'SendTransaction',
                maxMessages: 4,
                extraCurrencySupported: false
            }
        ]
    },
    {
        app_name: 'uxuyWallet',
        name: 'UXUY Wallet',
        image: 'https://chain-cdn.uxuy.com/logo/square_288.png',
        about_url: 'https://docs.uxuy.com',
        universal_url: 'https://t.me/UXUYbot?attach=wallet',
        bridge: [
            {
                type: 'sse',
                url: 'https://bridge.uxuy.me/bridge'
            }
        ],
        platforms: ['ios', 'android', 'macos', 'windows', 'linux'],
        features: [
            {
                name: 'SendTransaction',
                maxMessages: 4,
                extraCurrencySupported: false
            }
        ]
    },
    {
        app_name: 'tonkeeper-pro',
        name: 'Tonkeeper Pro',
        image: 'https://tonkeeper.com/assets/tonconnect-icon-pro.png',
        tondns: 'tonkeeper.ton',
        about_url: 'https://tonkeeper.com/pro',
        universal_url: 'https://app.tonkeeper.com/pro/ton-connect',
        deepLink: 'tonkeeper-pro-tc://',
        bridge: [
            {
                type: 'sse',
                url: 'https://bridge.tonapi.io/bridge'
            }
        ],
        platforms: ['ios', 'macos', 'windows', 'linux'],
        features: [
            {
                name: 'SendTransaction',
                maxMessages: 255,
                extraCurrencySupported: true
            },
            {
                name: 'SignData',
                types: ['text', 'binary', 'cell']
            }
        ]
    },
    {
        app_name: 'nicegramWallet',
        name: 'Nicegram Wallet',
        image: 'https://static.nicegram.app/icon.png',
        about_url: 'https://nicegram.app',
        universal_url: 'https://nicegram.app/tc',
        deepLink: 'nicegram-tc://',
        bridge: [
            {
                type: 'sse',
                url: 'https://tc.nicegram.app/bridge'
            },
            {
                type: 'js',
                key: 'nicegramWallet'
            }
        ],
        platforms: ['ios', 'android'],
        features: [
            {
                name: 'SendTransaction',
                maxMessages: 255,
                extraCurrencySupported: false
            }
        ]
    },
    {
        app_name: 'echoooTonWallet',
        name: 'EchoooWallet',
        image: 'https://cdn.echooo.xyz/front-end/source/images/logo/echooo-ton.png',
        about_url: 'https://www.echooo.xyz',
        universal_url: 'https://www.echooo.xyz/ton-connect',
        deepLink: 'echooo://',
        bridge: [
            {
                type: 'js',
                key: 'echoooTonWallet'
            },
            {
                type: 'sse',
                url: 'https://ton-connect-bridge.echooo.link/bridge'
            }
        ],
        platforms: ['ios', 'android'],
        features: [
            {
                name: 'SendTransaction',
                maxMessages: 255,
                extraCurrencySupported: false
            }
        ]
    },
    {
        app_name: 'blitzwallet',
        name: 'BLITZ wallet',
        image: 'https://blitzwallet.cfd/wallet/public/logo.png',
        about_url: 'https://blitzwallet.cfd',
        universal_url: 'https://t.me/blitz_wallet_bot?attach=wallet',
        bridge: [
            {
                type: 'sse',
                url: 'https://blitzwallet.cfd/bridge/'
            }
        ],
        platforms: ['ios', 'android', 'macos', 'windows', 'linux'],
        features: [
            {
                name: 'SendTransaction',
                maxMessages: 4,
                extraCurrencySupported: false
            }
        ]
    },
    {
        app_name: 'koloWeb3Wallet',
        name: 'Kolo',
        image: 'https://raw.githubusercontent.com/onidev1/tc-assets/refs/heads/main/kolo_logo_288.png',
        about_url: 'https://kolo.xyz',
        universal_url: 'https://t.me/kolo?attach=wallet',
        bridge: [
            {
                type: 'sse',
                url: 'https://web3-bridge.kolo.in/bridge'
            }
        ],
        platforms: ['ios', 'android', 'macos', 'windows', 'linux'],
        features: [
            {
                name: 'SendTransaction',
                maxMessages: 255,
                extraCurrencySupported: false
            }
        ]
    },
    {
        app_name: 'imToken',
        name: 'imToken',
        image: 'https://aws-v2-cdn.token.im/orbit/token-v2/icons/logo-ton-connect.png',
        about_url: 'https://token.im',
        universal_url: 'https://connect.token.im/link/ton-connect',
        deepLink: 'imtokenv2://link/ton-connect',
        bridge: [
            {
                type: 'sse',
                url: 'https://connect.token.im/tonbridge'
            },
            {
                type: 'js',
                key: 'imToken'
            }
        ],
        platforms: ['ios', 'android'],
        features: [
            {
                name: 'SendTransaction',
                maxMessages: 255,
                extraCurrencySupported: false
            }
        ]
    },
    {
        app_name: 'cactuslink',
        name: 'Cactus Link',
        image: 'https://downloads.mycactus.com/288_cactus_link.png',
        about_url: 'https://www.mycactus.com/defi-connector',
        bridge: [
            {
                type: 'js',
                key: 'cactuslink_ton'
            }
        ],
        platforms: ['chrome'],
        features: [
            {
                name: 'SendTransaction',
                maxMessages: 4,
                extraCurrencySupported: false
            },
            {
                name: 'SignData',
                types: ['text', 'binary']
            }
        ]
    },
    {
        app_name: 'onekey',
        name: 'OneKey',
        image: 'https://uni.onekey-asset.com/static/logo/onekey-x288.png',
        about_url: 'https://onekey.so',
        bridge: [
            {
                type: 'js',
                key: 'onekeyTonWallet'
            }
        ],
        platforms: ['chrome'],
        features: [
            {
                name: 'SendTransaction',
                maxMessages: 4,
                extraCurrencySupported: false
            }
        ]
    }
];
