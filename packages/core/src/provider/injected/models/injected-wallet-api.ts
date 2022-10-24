import { AppRequest, ConnectRequest, RpcMethod, WalletEvent, WalletResponse } from 'src/models';
import { DeviceInfo } from 'src/models/protocol/wallet-message/initial-reply/device-info';
import { InitialReply } from 'src/models/protocol/wallet-message/initial-reply/initial-reply';

export interface InjectedWalletApi {
    deviceInfo: DeviceInfo;
    protocolVersion: number;
    connect(protocolVersion: number, message: ConnectRequest, auto: boolean): Promise<InitialReply>;
    send<T extends RpcMethod>(message: AppRequest<T>): Promise<WalletResponse<T>>;
    listen(callback: (event: WalletEvent) => void): void;
}
