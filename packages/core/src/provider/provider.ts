import {
    AppRequest,
    ConnectRequest,
    RpcMethod,
    WalletEvent,
    WalletResponse
} from '@ton-connect/protocol';
import { InjectedProvider } from 'src/provider/injected/injected-provider';
import { WithoutId } from 'src/utils/types';

export type Provider = InjectedProvider | HTTPProvider;

export interface InternalProvider extends BaseProvider {
    type: 'injected';
    connect(message: ConnectRequest, auto?: boolean): void;
}

export interface HTTPProvider extends BaseProvider {
    type: 'http';
    connect(message: ConnectRequest): string;
}

interface BaseProvider {
    closeConnection(): void;
    disconnect(): Promise<void>;
    sendRequest<T extends RpcMethod>(
        request: WithoutId<AppRequest<T>>
    ): Promise<WithoutId<WalletResponse<T>>>;
    listen(eventsCallback: (e: WalletEvent) => void): void;
}
