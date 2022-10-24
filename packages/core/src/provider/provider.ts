import { AppRequest, ConnectRequest, RpcMethod, WalletEvent, WalletResponse } from 'src/models';
import { InjectedProvider } from 'src/provider/injected/injected-provider';

export type Provider = InjectedProvider | HTTPProvider;

export interface InternalProvider extends BaseProvider {
    connect(message: ConnectRequest): Promise<void>;
}

export interface HTTPProvider extends BaseProvider {
    connect(message: ConnectRequest, auto?: boolean): Promise<string>;
}

interface BaseProvider {
    disconnect(): Promise<void>;
    sendRequest<T extends RpcMethod>(request: AppRequest<T>): Promise<WalletResponse<T>>;
    listen(eventsCallback: (e: WalletEvent) => void): void;
}
