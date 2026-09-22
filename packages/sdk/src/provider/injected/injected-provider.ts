import { WalletNotInjectedError } from 'src/errors/wallet/wallet-not-injected.error';
import { TonConnectError } from 'src/errors/ton-connect.error';
import { WalletTransportError } from 'src/errors/wallet/wallet-transport.error';
import { legacyWalletErrorFrom } from 'src/errors/wallet-response/legacy-wallet-error';
import { attachError, markNormalized } from 'src/errors/wallet-response/marks';
import {
    CONNECT_WALLET_ERROR_CODES,
    RPC_WALLET_ERROR_CODES
} from 'src/errors/wallet-response/wallet-response-to-error';
import {
    AppRequest,
    ConnectEvent,
    ConnectEventError,
    ConnectRequest,
    RpcMethod,
    WalletResponse
} from '@tonconnect/protocol';
import {
    InjectedWalletApi,
    isJSBridgeWithMetadata
} from 'src/provider/injected/models/injected-wallet-api';
import { InternalProvider } from 'src/provider/provider';
import { BridgeConnectionStorage } from 'src/storage/bridge-connection-storage';
import { OptionalTraceable, Traceable, WithoutId } from 'src/utils/types';
import { getWindow, getWindowEntries } from 'src/utils/web-api';
import { PROTOCOL_VERSION } from 'src/resources/protocol';
import { WalletInfoCurrentlyInjected } from 'src/models';
import { logDebug } from 'src/utils/log';
import { Analytics } from 'src/analytics/analytics';
import { AnalyticsManager } from 'src/analytics/analytics-manager';
import { JsBridgeEvent } from 'src/analytics/types';
import { UUIDv7 } from 'src/utils/uuid';
import { TraceableWalletEvent } from 'src/models/wallet/traceable-events';

type WindowWithTon<T extends string> = {
    [key in T]: {
        tonconnect: InjectedWalletApi;
    };
} & Window;

export class InjectedProvider<T extends string = string> implements InternalProvider {
    private static window = getWindow();

    public static async fromStorage(
        storage: BridgeConnectionStorage,
        analyticsManager?: AnalyticsManager
    ): Promise<InjectedProvider> {
        const connection = await storage.getInjectedConnection();
        return new InjectedProvider(storage, connection.jsBridgeKey, analyticsManager);
    }

    public static isWalletInjected(injectedWalletKey: string): boolean {
        return InjectedProvider.isWindowContainsWallet(this.window, injectedWalletKey);
    }

    public static isInsideWalletBrowser(injectedWalletKey: string): boolean {
        if (InjectedProvider.isWindowContainsWallet(this.window, injectedWalletKey)) {
            return this.window[injectedWalletKey]!.tonconnect.isWalletBrowser;
        }

        return false;
    }

    public static getCurrentlyInjectedWallets(): WalletInfoCurrentlyInjected[] {
        if (!this.window) {
            return [];
        }

        const windowEntries = getWindowEntries();
        const wallets = windowEntries.filter(([_key, value]) => isJSBridgeWithMetadata(value)) as [
            string,
            { tonconnect: InjectedWalletApi }
        ][];

        return wallets.map(([jsBridgeKey, wallet]) => ({
            name: wallet.tonconnect.walletInfo.name,
            appName: wallet.tonconnect.walletInfo.app_name,
            aboutUrl: wallet.tonconnect.walletInfo.about_url,
            imageUrl: wallet.tonconnect.walletInfo.image,
            tondns: wallet.tonconnect.walletInfo.tondns,
            jsBridgeKey,
            injected: true,
            embedded: wallet.tonconnect.isWalletBrowser,
            platforms: wallet.tonconnect.walletInfo.platforms,
            features: wallet.tonconnect.walletInfo.features
        }));
    }

    private static isWindowContainsWallet<T extends string>(
        window: Window | undefined,
        injectedWalletKey: string
    ): window is WindowWithTon<T> {
        return (
            !!window &&
            injectedWalletKey in window &&
            typeof window[injectedWalletKey as keyof Window] === 'object' &&
            'tonconnect' in window[injectedWalletKey as keyof Window]
        );
    }

    public readonly type = 'injected';

    private unsubscribeCallback: (() => void) | null = null;

    private injectedWallet: InjectedWalletApi;

    private listenSubscriptions = false;

    private listeners: Array<(e: TraceableWalletEvent) => void> = [];
    private readonly analytics?: Analytics<
        JsBridgeEvent,
        'bridge_key' | 'wallet_app_name' | 'wallet_app_version'
    >;

    constructor(
        private readonly connectionStorage: BridgeConnectionStorage,
        private readonly injectedWalletKey: T,
        analyticsManager?: AnalyticsManager
    ) {
        const window: Window | undefined | WindowWithTon<T> = InjectedProvider.window;
        if (!InjectedProvider.isWindowContainsWallet(window, injectedWalletKey)) {
            throw new WalletNotInjectedError();
        }

        this.injectedWallet = window[injectedWalletKey]!.tonconnect!;

        if (analyticsManager) {
            this.analytics = analyticsManager.scoped({
                bridge_key: injectedWalletKey,
                wallet_app_name: this.injectedWallet.deviceInfo.appName,
                wallet_app_version: this.injectedWallet.deviceInfo.appVersion
            });
        }
    }

    public connect(message: ConnectRequest, options?: OptionalTraceable): void {
        this._connect(PROTOCOL_VERSION, message, options).catch(e => logDebug(e));
    }

    public async restoreConnection(options?: OptionalTraceable): Promise<void> {
        const traceId = options?.traceId ?? UUIDv7();
        try {
            logDebug(`Injected Provider restoring connection...`);
            this.analytics?.emitJsBridgeCall({
                js_bridge_method: 'restoreConnection',
                trace_id: traceId
            });
            const connectEvent = await this.injectedWallet.restoreConnection();
            this.analytics?.emitJsBridgeResponse({
                js_bridge_method: 'restoreConnection',
                trace_id: traceId
            });
            logDebug('Injected Provider restoring connection response', connectEvent);

            if (connectEvent.event === 'connect') {
                this.makeSubscriptions({ traceId });
                this.listeners.forEach(listener => listener({ ...connectEvent, traceId }));
            } else {
                await this.connectionStorage.removeConnection();
            }
        } catch (e) {
            this.analytics?.emitJsBridgeError({
                js_bridge_method: 'restoreConnection',
                error_message: String(e),
                trace_id: traceId
            });
            await this.connectionStorage.removeConnection();
            console.error(e);
        }
    }

    public closeConnection(): void {
        if (this.listenSubscriptions) {
            this.injectedWallet.disconnect();
        }
        this.closeAllListeners();
    }

    public async disconnect(options?: OptionalTraceable): Promise<void> {
        const traceId = options?.traceId ?? UUIDv7();
        return new Promise((resolve, reject) => {
            let finalized = false;
            const finalize = (): void => {
                if (finalized) {
                    return;
                }
                finalized = true;
                try {
                    this.closeAllListeners();
                } catch (e) {
                    logDebug(e);
                }
                this.connectionStorage.removeConnection().then(resolve, reject);
            };

            try {
                this.injectedWallet.disconnect();
                finalize();
            } catch (e) {
                logDebug(e);

                void this.sendRequest(
                    {
                        method: 'disconnect',
                        params: []
                    },
                    { onRequestSent: finalize, traceId }
                )
                    .catch(logDebug)
                    .then(finalize);
            }
        });
    }

    private closeAllListeners(): void {
        this.listenSubscriptions = false;
        this.listeners = [];
        this.unsubscribeCallback?.();
    }

    public listen(eventsCallback: (e: TraceableWalletEvent) => void): () => void {
        this.listeners.push(eventsCallback);
        return () =>
            (this.listeners = this.listeners.filter(listener => listener !== eventsCallback));
    }

    public sendRequest<T extends RpcMethod>(
        request: WithoutId<AppRequest<T>>,
        options?: OptionalTraceable<{
            onRequestSent?: () => void;
            signal?: AbortSignal;
            attempts?: number;
        }>
    ): Promise<WithoutId<WalletResponse<T>>>;
    /** @deprecated use sendRequest(transaction, options) instead */
    public sendRequest<T extends RpcMethod>(
        request: WithoutId<AppRequest<T>>,
        onRequestSent?: () => void
    ): Promise<WithoutId<WalletResponse<T>>>;
    public async sendRequest<T extends RpcMethod>(
        request: WithoutId<AppRequest<T>>,
        optionsOrOnRequestSent?:
            | (() => void)
            | OptionalTraceable<{
                  onRequestSent?: () => void;
                  signal?: AbortSignal;
                  attempts?: number;
              }>
    ): Promise<WithoutId<WalletResponse<T>>> {
        // TODO: remove deprecated method
        const options: OptionalTraceable<{
            onRequestSent?: () => void;
            signal?: AbortSignal;
            attempts?: number;
        }> = {};
        if (typeof optionsOrOnRequestSent === 'function') {
            options.onRequestSent = optionsOrOnRequestSent;
            options.traceId = UUIDv7();
        } else {
            options.onRequestSent = optionsOrOnRequestSent?.onRequestSent;
            options.signal = optionsOrOnRequestSent?.signal;
            options.attempts = optionsOrOnRequestSent?.attempts;
            options.traceId = optionsOrOnRequestSent?.traceId ?? UUIDv7();
        }

        let id: string;
        let pending: Promise<WalletResponse<T>>;
        try {
            id = (await this.connectionStorage.getNextRpcRequestId()).toString();
            await this.connectionStorage.increaseNextRpcRequestId();

            logDebug('Send injected-bridge request:', { ...request, id });
            this.analytics?.emitJsBridgeCall({
                js_bridge_method: 'send'
            });
            pending = Promise.resolve(
                this.injectedWallet.send<T>({ ...request, id } as AppRequest<T>)
            );
        } catch (e) {
            throw new WalletTransportError('Could not send the request to the injected wallet', {
                cause: e
            });
        }

        // Handlers go on before the dApp callback runs, so a callback that throws cannot
        // leave the wallet's later rejection unhandled.
        const settled = pending.then(
            response => {
                if (typeof response !== 'object' || response === null) {
                    this.analytics?.emitJsBridgeError({
                        js_bridge_method: 'send',
                        error_message: describeRejection(response)
                    });
                    throw new WalletTransportError(
                        'Injected wallet answered without a TON Connect response',
                        { cause: response }
                    );
                }

                this.analytics?.emitJsBridgeResponse({
                    js_bridge_method: 'send'
                });
                logDebug('Wallet message received:', response);
                return response;
            },
            reason => {
                this.analytics?.emitJsBridgeError({
                    js_bridge_method: 'send',
                    error_message: describeRejection(reason)
                });

                const error = legacyWalletErrorFrom(reason, RPC_WALLET_ERROR_CODES);
                if (!error) {
                    throw new WalletTransportError(
                        'Injected wallet rejected the request without a TON Connect error response',
                        { cause: reason }
                    );
                }

                markNormalized(error);
                const response = { id, error } as WalletResponse<T>;
                logDebug('Wallet request rejected, normalized:', response);
                return response;
            }
        );

        try {
            options.onRequestSent?.();
        } catch (e) {
            settled.catch(reason => logDebug(reason));
            throw e;
        }

        return settled;
    }

    private async _connect(
        protocolVersion: number,
        message: ConnectRequest,
        options?: OptionalTraceable
    ): Promise<void> {
        const traceId = options?.traceId ?? UUIDv7();

        let connectEvent: OptionalTraceable<ConnectEvent>;
        try {
            logDebug(
                `Injected Provider connect request: protocolVersion: ${protocolVersion}, message:`,
                message
            );
            this.analytics?.emitJsBridgeCall({
                js_bridge_method: 'connect',
                trace_id: traceId
            });
            connectEvent = await this.injectedWallet.connect(protocolVersion, message);
        } catch (e) {
            this.analytics?.emitJsBridgeError({
                js_bridge_method: 'connect',
                error_message: describeRejection(e),
                trace_id: traceId
            });
            logDebug('Injected Provider connect error:', e);

            const legacy = legacyWalletErrorFrom(e, CONNECT_WALLET_ERROR_CODES);
            if (legacy) {
                markNormalized(legacy);
                this.emitConnectError(legacy, traceId);
            } else {
                this.emitConnectFailure(
                    e,
                    new WalletTransportError(
                        'Injected wallet rejected the connection without a TON Connect event',
                        { cause: e }
                    ),
                    traceId
                );
            }
            return;
        }

        if (typeof connectEvent !== 'object' || connectEvent === null) {
            this.analytics?.emitJsBridgeError({
                js_bridge_method: 'connect',
                error_message: describeRejection(connectEvent),
                trace_id: traceId
            });
            this.emitConnectFailure(
                connectEvent,
                new WalletTransportError(
                    'Injected wallet answered the connection without a TON Connect event',
                    { cause: connectEvent }
                ),
                traceId
            );
            return;
        }

        try {
            this.analytics?.emitJsBridgeResponse({
                js_bridge_method: 'connect'
            });
            logDebug('Injected Provider connect response:', connectEvent);

            if (connectEvent.event === 'connect') {
                await this.updateSession();
                this.makeSubscriptions({ traceId });
            }
            this.listeners.forEach(listener => listener({ ...connectEvent, traceId }));
        } catch (e) {
            logDebug('Injected Provider connect error:', e);
            this.emitConnectFailure(
                e,
                new TonConnectError('Injected connection could not be completed', { cause: e }),
                traceId
            );
        }
    }

    /** Reports a connection failure that has no wallet error code behind it. */
    private emitConnectFailure(cause: unknown, error: TonConnectError, traceId: string): void {
        const payload = { code: 0, message: describeRejection(cause) };
        attachError(payload, error);
        this.emitConnectError(payload, traceId);
    }

    private emitConnectError(payload: { code: number; message: string }, traceId: string): void {
        const connectEventError = {
            event: 'connect_error',
            payload
        } as WithoutId<ConnectEventError>;
        this.listeners.forEach(listener => listener({ ...connectEventError, traceId }));
    }

    private makeSubscriptions(options: Traceable): void {
        this.listenSubscriptions = true;
        this.analytics?.emitJsBridgeCall({
            js_bridge_method: 'listen',
            trace_id: options.traceId
        });
        try {
            this.unsubscribeCallback = this.injectedWallet.listen(e => {
                const traceId = e.traceId ?? UUIDv7();
                logDebug('Wallet message received:', e);

                if (this.listenSubscriptions) {
                    this.listeners.forEach(listener => listener({ ...e, traceId }));
                }

                if (e.event === 'disconnect') {
                    this.disconnect({ traceId }).catch(e => logDebug(e));
                }
            });
            this.analytics?.emitJsBridgeResponse({
                js_bridge_method: 'listen',
                trace_id: options.traceId
            });
        } catch (err) {
            this.analytics?.emitJsBridgeError({
                js_bridge_method: 'listen',
                error_message: String(err),
                trace_id: options.traceId
            });
            throw err;
        }
    }

    private updateSession(): Promise<void> {
        return this.connectionStorage.storeConnection({
            type: 'injected',
            jsBridgeKey: this.injectedWalletKey,
            nextRpcRequestId: 0
        });
    }
}

function describeRejection(reason: unknown): string {
    try {
        return String(reason);
    } catch {
        return Object.prototype.toString.call(reason);
    }
}
