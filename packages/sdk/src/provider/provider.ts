import {
    AppRequest,
    ConnectRequest,
    RpcMethod,
    WalletEvent,
    WalletResponse
} from '@tonconnect/protocol';
import { WithoutId, WithoutIdDistributive } from 'src/utils/types';

export type Provider = InternalProvider | HTTPProvider;

export interface InternalProvider extends BaseProvider {
    type: 'injected';

    connect(message: ConnectRequest): void;
}

export interface HTTPProvider extends BaseProvider {
    type: 'http';

    connect(
        message: ConnectRequest,
        options?: {
            openingDeadlineMS?: number;
            signal?: AbortSignal;
        }
    ): string;

    pause(): void;

    unPause(options?: { openingDeadlineMS?: number; signal?: AbortSignal }): Promise<void>;
}

interface BaseProvider {
    restoreConnection(options?: {
        openingDeadlineMS?: number;
        signal?: AbortSignal;
    }): Promise<void>;

    closeConnection(): void;

    disconnect(options?: { signal?: AbortSignal }): Promise<void>;

    sendRequest<T extends RpcMethod>(
        request: WithoutId<AppRequest<T>>,
        options?: {
            onRequestSent?: () => void;
            signal?: AbortSignal;
            attempts?: number;
        }
    ): Promise<WithoutId<WalletResponse<T>>>;

    /** @deprecated use sendRequest(transaction, options) instead */
    sendRequest<T extends RpcMethod>(
        request: WithoutId<AppRequest<T>>,
        onRequestSent?: () => void
    ): Promise<WithoutId<WalletResponse<T>>>;

    listen(eventsCallback: (e: WithoutIdDistributive<WalletEvent>) => void): void;
}
