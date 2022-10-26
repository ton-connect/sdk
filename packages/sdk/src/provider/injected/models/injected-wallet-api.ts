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
    connect(protocolVersion: number, message: ConnectRequest, auto: boolean): Promise<ConnectEvent>;
    autoConnect(): Promise<ConnectEvent>;
    send<T extends RpcMethod>(message: AppRequest<T>): Promise<WalletResponse<T>>;
    listen(callback: (event: WalletEvent) => void): () => void;
}
