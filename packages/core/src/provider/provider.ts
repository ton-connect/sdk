import { AppRequest, ConnectRequest, RpcMethod, WalletEvent, WalletResponse } from 'src/models';
import { InjectedProvider } from 'src/provider/injected/injected-provider';
import { WithoutId } from 'src/utils/types';

export type Provider = InjectedProvider | HTTPProvider;

export interface InternalProvider extends BaseProvider {
    connect(message: ConnectRequest, auto?: boolean): void;
}

export interface HTTPProvider extends BaseProvider {
    connect(message: ConnectRequest): string;
}

interface BaseProvider {
    disconnect(): Promise<void>;
    sendRequest<T extends RpcMethod>(
        request: WithoutId<AppRequest<T>>
    ): Promise<WithoutId<WalletResponse<T>>>;
    listen(eventsCallback: (e: WalletEvent) => void): void;
}
