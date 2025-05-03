export const defaultWalletsList = {
    source: [
        {
            app_name: 'tonkeeper',
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
            ],
            platforms: ['ios', 'android', 'chrome', 'firefox']
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
    ],
    parsed: [
        {
            name: 'Tonkeeper',
            appName: 'tonkeeper',
            imageUrl: 'https://tonkeeper.com/assets/tonconnect-icon.png',
            aboutUrl: 'https://tonkeeper.com',
            tondns: 'tonkeeper.ton',
            platforms: ['ios', 'android', 'chrome', 'firefox'],
            bridgeUrl: 'https://bridge.tonapi.io/bridge',
            universalLink: 'https://app.tonkeeper.com/ton-connect',
            jsBridgeKey: 'tonkeeper',
            injected: false,
            embedded: false
        },
        {
            name: 'OpenMask',
            appName: 'openmask',
            imageUrl:
                'https://raw.githubusercontent.com/OpenProduct/openmask-extension/main/public/openmask-logo-288.png',
            aboutUrl: 'https://www.openmask.app/',
            platforms: ['chrome'],
            jsBridgeKey: 'openmask',
            injected: false,
            embedded: false
        },
        {
            name: 'MyTonWallet',
            appName: 'mytonwallet',
            imageUrl: 'https://mytonwallet.io/icon-256.png',
            aboutUrl: 'https://mytonwallet.io',
            platforms: ['chrome', 'windows', 'macos', 'linux'],
            jsBridgeKey: 'mytonwallet',
            injected: false,
            embedded: false,
            bridgeUrl: 'https://tonconnectbridge.mytonwallet.org/bridge/',
            universalLink: 'https://connect.mytonwallet.org'
        },
        {
            name: 'Tonhub',
            appName: 'tonhub',
            imageUrl: 'https://tonhub.com/tonconnect_logo.png',
            aboutUrl: 'https://tonhub.com',
            platforms: ['ios', 'android'],
            jsBridgeKey: 'tonhub',
            injected: false,
            embedded: false,
            bridgeUrl: 'https://connect.tonhubapi.com/tonconnect',
            universalLink: 'https://tonhub.com/ton-connect'
        },
        {
            name: 'TonFlow',
            appName: 'tonflow',
            imageUrl: 'https://tonflow.net/assets/images/tonflow_ico_192.png',
            aboutUrl: 'https://tonflow.net',
            platforms: ['chrome'],
            jsBridgeKey: 'tonflow',
            injected: false,
            embedded: false
        },
        {
            name: 'DeWallet',
            appName: 'dewallet',
            imageUrl: 'https://app.delabwallet.com/logo_black.png',
            aboutUrl: 'https://delabwallet.com',
            platforms: ['chrome'],
            jsBridgeKey: 'dewallet',
            injected: false,
            embedded: false
        },
        {
            name: 'XTONWallet',
            appName: 'xtonwallet',
            imageUrl: 'https://xtonwallet.com/assets/img/icon-256-back.png',
            aboutUrl: 'https://xtonwallet.com',
            platforms: ['chrome', 'firefox'],
            jsBridgeKey: 'xtonwallet',
            injected: false,
            embedded: false
        },
        {
            name: 'TON Wallet',
            appName: 'tonwallet',
            imageUrl: 'https://wallet.ton.org/assets/ui/qr-logo.png',
            aboutUrl:
                'https://chrome.google.com/webstore/detail/ton-wallet/nphplpgoakhhjchkkhmiggakijnkhfnd',
            platforms: ['chrome'],
            jsBridgeKey: 'tonwallet',
            injected: false,
            embedded: false
        }
    ]
};

export const walletsListWithWrongWallet = {
    source: [
        {
            app_name: 'tonkeeper',
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
            ],
            platforms: ['ios', 'android', 'chrome', 'firefox']
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
            ]
        },
        {
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
        }
    ],
    parsed: [
        {
            name: 'Tonkeeper',
            appName: 'tonkeeper',
            imageUrl: 'https://tonkeeper.com/assets/tonconnect-icon.png',
            aboutUrl: 'https://tonkeeper.com',
            tondns: 'tonkeeper.ton',
            platforms: ['ios', 'android', 'chrome', 'firefox'],
            bridgeUrl: 'https://bridge.tonapi.io/bridge',
            universalLink: 'https://app.tonkeeper.com/ton-connect',
            jsBridgeKey: 'tonkeeper',
            injected: false,
            embedded: false
        },
        {
            name: 'OpenMask',
            appName: 'openmask',
            imageUrl:
                'https://raw.githubusercontent.com/OpenProduct/openmask-extension/main/public/openmask-logo-288.png',
            aboutUrl: 'https://www.openmask.app/',
            platforms: ['chrome'],
            jsBridgeKey: 'openmask',
            injected: false,
            embedded: false
        },
        {
            name: 'MyTonWallet',
            appName: 'mytonwallet',
            imageUrl: 'https://mytonwallet.io/icon-256.png',
            aboutUrl: 'https://mytonwallet.io',
            platforms: ['chrome', 'windows', 'macos', 'linux'],
            jsBridgeKey: 'mytonwallet',
            injected: false,
            embedded: false,
            bridgeUrl: 'https://tonconnectbridge.mytonwallet.org/bridge/',
            universalLink: 'https://connect.mytonwallet.org'
        }
    ]
};

export const wrongWalletsList = {
    source: {
        prop: '123'
    }
};
