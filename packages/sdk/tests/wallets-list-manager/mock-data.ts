export const defaultWalletsList = {
    source: [
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
    ],
    parsed: [
        {
            name: 'Tonkeeper',
            imageUrl: 'https://tonkeeper.com/assets/tonconnect-icon.png',
            aboutUrl: 'https://tonkeeper.com',
            tondns: 'tonkeeper.ton',
            bridgeUrl: 'https://bridge.tonapi.io/bridge',
            universalLink: 'https://app.tonkeeper.com/ton-connect',
            jsBridgeKey: 'tonkeeper',
            injected: false,
            embedded: false
        },
        {
            name: 'OpenMask',
            imageUrl:
                'https://raw.githubusercontent.com/OpenProduct/openmask-extension/main/public/openmask-logo-288.png',
            aboutUrl: 'https://www.openmask.app/',
            jsBridgeKey: 'openmask',
            injected: false,
            embedded: false
        },
        {
            name: 'MyTonWallet',
            imageUrl: 'https://mytonwallet.io/icon-256.png',
            aboutUrl: 'https://mytonwallet.io',
            jsBridgeKey: 'mytonwallet',
            injected: false,
            embedded: false
        }
    ]
};

export const walletsListWithWrongWallet = {
    source: [
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
        },
        {
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
            ]
        }
    ],
    parsed: [
        {
            name: 'Tonkeeper',
            imageUrl: 'https://tonkeeper.com/assets/tonconnect-icon.png',
            aboutUrl: 'https://tonkeeper.com',
            tondns: 'tonkeeper.ton',
            bridgeUrl: 'https://bridge.tonapi.io/bridge',
            universalLink: 'https://app.tonkeeper.com/ton-connect',
            jsBridgeKey: 'tonkeeper',
            injected: false,
            embedded: false
        },
        {
            name: 'OpenMask',
            imageUrl:
                'https://raw.githubusercontent.com/OpenProduct/openmask-extension/main/public/openmask-logo-288.png',
            aboutUrl: 'https://www.openmask.app/',
            jsBridgeKey: 'openmask',
            injected: false,
            embedded: false
        },
        {
            name: 'MyTonWallet',
            imageUrl: 'https://mytonwallet.io/icon-256.png',
            aboutUrl: 'https://mytonwallet.io',
            jsBridgeKey: 'mytonwallet',
            injected: false,
            embedded: false
        }
    ]
};

export const wrongWalletsList = {
    source: {
        prop: '123'
    }
};
