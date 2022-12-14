import {
    AppRequest,
    ConnectEvent,
    ConnectRequest,
    DeviceInfo,
    RpcMethod,
    WalletEvent,
    WalletResponse
} from '@tonconnect/protocol';

export interface InjectedWalletApi {
    deviceInfo: DeviceInfo;
    protocolVersion: number;
    isWalletBrowser: boolean;
    connect(protocolVersion: number, message: ConnectRequest): Promise<ConnectEvent>;
    restoreConnection(): Promise<ConnectEvent>;
    send<T extends RpcMethod>(message: AppRequest<T>): Promise<WalletResponse<T>>;
    listen(callback: (event: WalletEvent) => void): () => void;
    disconnect(): void;
}
