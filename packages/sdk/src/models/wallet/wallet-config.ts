export interface WalletConfigBase {
    name: string;
    imageUrl: string;
    tondns?: string;
    aboutUrl: string;
}

export interface HTTPBridgeWalletConfig extends WalletConfigBase {
    universalLinkBase: string;
    bridgeUrl: string;
}

export interface JSBridgeWalletConfig extends WalletConfigBase {
    jsBridgeKey: string;
}

export type WalletConfig =
    | HTTPBridgeWalletConfig
    | JSBridgeWalletConfig
    | (HTTPBridgeWalletConfig & JSBridgeWalletConfig);

export interface WalletConfigDTOBase {
    name: string;
    image: string;
    tondns?: string;
    about_url: string;
}

export interface HTTPBridgeWalletConfigDTO extends WalletConfigDTOBase {
    universal_url: string;
    bridge_url: string;
}

export interface JSBridgeWalletConfigDTO extends WalletConfigDTOBase {
    js_bridge_key: string;
}

export type WalletConfigDTO =
    | HTTPBridgeWalletConfigDTO
    | JSBridgeWalletConfigDTO
    | (HTTPBridgeWalletConfigDTO & JSBridgeWalletConfigDTO);
