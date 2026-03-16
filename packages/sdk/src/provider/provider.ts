import { AppRequest, ConnectRequest, RpcMethod } from '@tonconnect/protocol';
import type { RawIntentPayload } from 'src/models/intent-payload';
import { OptionalTraceable, WithoutId } from 'src/utils/types';
import { TraceableWalletEvent, TraceableWalletResponse } from 'src/models/wallet/traceable-events';
import type { IntentResponse } from 'src/models';

export type Provider = InternalProvider | HTTPProvider;

export interface InternalProvider extends BaseProvider {
    type: 'injected';

    /**
     * Establishes a connection using a ConnectRequest (classic TonConnect flow).
     */
    connect(message: ConnectRequest, options?: OptionalTraceable): void;

    /**
     * Connects with intent (draft payload) via injected wallet.
     */
    connectWithIntent(payload: WithoutId<RawIntentPayload>, options?: OptionalTraceable): void;
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

    /**
     * Connects with intent (draft payload) via bridge as a tc:// universal link.
     * connectRequest is passed at URL level (r param), not inside the payload.
     */
    connectWithIntent(
        payload: WithoutId<RawIntentPayload>,
        options?: OptionalTraceable<{
            connectRequest?: ConnectRequest;
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
    onIntentResponse(listener: (response: IntentResponse) => void): () => void;
}
