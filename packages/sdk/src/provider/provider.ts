import {
    AppRequest,
    ConnectRequest,
    RpcMethod,
    WalletEvent,
    WalletResponse
} from '@tonconnect/protocol';
import {WithoutId, WithoutIdDistributive} from 'src/utils/types';

export type Provider = InternalProvider | HTTPProvider;

export interface InternalProvider extends BaseProvider {
    type: 'injected';
    connect(message: ConnectRequest): void;
}

export interface HTTPProvider extends BaseProvider {
    type: 'http';

    connect(message: ConnectRequest): string;

    pause(): void;

    unPause(): Promise<void>;
}

interface BaseProvider {
    restoreConnection(): Promise<void>;
    closeConnection(): void;
    disconnect(): Promise<void>;
    sendRequest<T extends RpcMethod>(
        request: WithoutId<AppRequest<T>>,
        onRequestSent?: () => void
    ): Promise<WithoutId<WalletResponse<T>>>;
    listen(eventsCallback: (e: WithoutIdDistributive<WalletEvent>) => void): void;
}
