export interface WalletInfoBase {
    name: string;
    imageUrl: string;
    tondns?: string;
    aboutUrl: string;
}

export interface WalletInfoRemote extends WalletInfoBase {
    universalLink: string;
    bridgeUrl: string;
}

export interface WalletInfoInjected extends WalletInfoBase {
    jsBridgeKey: string;
    injected: boolean;
    embedded: boolean;
}

export type WalletInfo =
    | WalletInfoRemote
    | WalletInfoInjected
    | (WalletInfoRemote & WalletInfoInjected);

export interface WalletInfoDTOBase {
    name: string;
    image: string;
    tondns?: string;
    about_url: string;
}

export interface WalletInfoRemoteDTO extends WalletInfoDTOBase {
    universal_url: string;
    bridge_url: string;
}

export interface WalletInfoInjectedDTO extends WalletInfoDTOBase {
    js_bridge_key: string;
}

export type WalletInfoDTO =
    | WalletInfoRemoteDTO
    | WalletInfoInjectedDTO
    | (WalletInfoRemoteDTO & WalletInfoInjectedDTO);

export function isWalletInfoInjected(value: WalletInfo): value is WalletInfoInjected {
    return 'jsBridgeKey' in value;
}
