import { AppRequest, ConnectRequest, RpcMethod } from '@tonconnect/protocol';
import { OptionalTraceable, WithoutId } from 'src/utils/types';
import { TraceableWalletEvent, TraceableWalletResponse } from 'src/models/wallet/traceable-events';

export type Provider = InternalProvider | HTTPProvider;

export interface InternalProvider extends BaseProvider {
    type: 'injected';

    connect(message: ConnectRequest, options?: OptionalTraceable): void;
}

export interface HTTPProvider extends BaseProvider {
    type: 'http';

    connect(
        message: ConnectRequest,
        options?: OptionalTraceable<{
            openingDeadlineMS?: number;
            signal?: AbortSignal;
        }>
    ): string;

    pause(): void;

    unPause(options?: { openingDeadlineMS?: number; signal?: AbortSignal }): Promise<void>;
}

interface BaseProvider {
    restoreConnection(
        options?: OptionalTraceable<{
            openingDeadlineMS?: number;
            signal?: AbortSignal;
        }>
    ): Promise<void>;

    closeConnection(): void;

    disconnect(options?: OptionalTraceable<{ signal?: AbortSignal }>): Promise<void>;

    sendRequest<T extends RpcMethod>(
        request: WithoutId<AppRequest<T>>,
        options?: OptionalTraceable<{
            onRequestSent?: () => void;
            signal?: AbortSignal;
            attempts?: number;
        }>
    ): Promise<TraceableWalletResponse<T>>;

    /** @deprecated use sendRequest(transaction, options) instead */
    sendRequest<T extends RpcMethod>(
        request: WithoutId<AppRequest<T>>,
        onRequestSent?: () => void
    ): Promise<TraceableWalletResponse<T>>;

    listen(eventsCallback: (e: TraceableWalletEvent) => void): void;
}
