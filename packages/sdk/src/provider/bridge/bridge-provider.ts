import {
    AppRequest,
    Base64,
    ConnectEventSuccess,
    ConnectRequest,
    hexToByteArray,
    RpcMethod,
    SessionCrypto,
    TonAddressItemReply,
    WalletMessage,
    WalletResponse
} from '@tonconnect/protocol';
import type { RawIntentPayload, UniversalLinkMessage } from 'src/models/intent-payload';
import type { IntentResponse } from 'src/models';
import { TonConnectError } from 'src/errors/ton-connect.error';
import { WalletConnectionSourceHTTP } from 'src/models/wallet/wallet-connection-source';
import { BridgeGateway } from 'src/provider/bridge/bridge-gateway';
import {
    BridgeConnectionHttp,
    isPendingConnectionHttp
} from 'src/provider/bridge/models/bridge-connection';
import { BridgeIncomingMessage } from 'src/provider/bridge/models/bridge-incomming-message';
import { BridgePartialSession, BridgeSession } from 'src/provider/bridge/models/bridge-session';
import { HTTPProvider } from 'src/provider/provider';
import { BridgeConnectionStorage } from 'src/storage/bridge-connection-storage';
import { Optional, OptionalTraceable, Traceable, WithoutId } from 'src/utils/types';
import { PROTOCOL_VERSION } from 'src/resources/protocol';
import { logDebug, logError } from 'src/utils/log';
import { toBase64Url } from 'src/utils/base64';
import { addPathToUrl, encodeTelegramUrlParameters, isTelegramUrl } from 'src/utils/url';
import { callForSuccess } from 'src/utils/call-for-success';
import { createAbortController } from 'src/utils/create-abort-controller';
import { AnalyticsManager } from 'src/analytics/analytics-manager';
import { Analytics } from 'src/analytics/analytics';
import { BridgeClientEvent } from 'src/analytics/types';
import { TraceableWalletEvent, TraceableWalletResponse } from 'src/models/wallet/traceable-events';
import { UUIDv7 } from 'src/utils/uuid';
import { waitForSome } from 'src/utils/promise';

export class BridgeProvider implements HTTPProvider {
    private static readonly INTENT_TTL_SECONDS = 300;
    private static readonly MAX_INLINE_INTENT_URL_LENGTH = 1023;
    private static readonly DEFAULT_OBJECT_STORAGE_URL =
        'https://ton-connect-bridge-v3-staging.tapps.ninja/objects';
    public static async fromStorage(
        storage: BridgeConnectionStorage,
        analyticsManager?: AnalyticsManager
    ): Promise<BridgeProvider> {
        const connection = await storage.getHttpConnection();

        if (isPendingConnectionHttp(connection)) {
            return new BridgeProvider(storage, connection.connectionSource, analyticsManager);
        }
        return new BridgeProvider(
            storage,
            { bridgeUrl: connection.session.bridgeUrl },
            analyticsManager
        );
    }

    public readonly type = 'http';

    private readonly standardUniversalLink = 'tc://';

    private readonly pendingRequests = new Map<
        string,
        (response: TraceableWalletResponse<RpcMethod>) => void
    >();

    private session: BridgeSession | BridgePartialSession | null = null;

    private gateway: BridgeGateway | null = null;

    private pendingGateways: BridgeGateway[] = [];

    private listeners: Array<(e: TraceableWalletEvent) => void> = [];

    private readonly defaultOpeningDeadlineMS = 12000;

    private readonly defaultRetryTimeoutMS = 2000;

    private readonly optionalOpenGateways = 3;

    private abortController?: AbortController;

    private readonly analytics?: Analytics<BridgeClientEvent>;

    constructor(
        private readonly connectionStorage: BridgeConnectionStorage,
        private readonly walletConnectionSource:
            | Optional<WalletConnectionSourceHTTP, 'universalLink'>
            | Pick<WalletConnectionSourceHTTP, 'bridgeUrl'>[],
        private readonly analyticsManager?: AnalyticsManager
    ) {
        this.analytics = this.analyticsManager?.scoped();
    }

    public connect(
        message: ConnectRequest,
        options?: OptionalTraceable<{
            openingDeadlineMS?: number;
            signal?: AbortSignal;
        }>
    ): string {
        const traceId = options?.traceId ?? UUIDv7();

        this.subscribeToBridgeEvents({ ...options, traceId });
        const universalLink = this.obtainUniversalLink();

        return this.generateUniversalLink(
            universalLink,
            { connectRequest: message },
            {
                traceId,
                signal: options?.signal
            }
        );
    }

    private obtainUniversalLink() {
        const universalLink =
            'universalLink' in this.walletConnectionSource &&
            this.walletConnectionSource.universalLink
                ? this.walletConnectionSource.universalLink
                : this.standardUniversalLink;
        return universalLink;
    }

    private subscribeToBridgeEvents(
        options: OptionalTraceable<{
            openingDeadlineMS?: number;
            signal?: AbortSignal;
        }>
    ) {
        const abortController = createAbortController(options?.signal);
        this.abortController?.abort();
        this.abortController = abortController;

        this.closeGateways();

        const sessionCrypto = new SessionCrypto();

        this.session = {
            sessionCrypto,
            bridgeUrl:
                'bridgeUrl' in this.walletConnectionSource
                    ? this.walletConnectionSource.bridgeUrl
                    : ''
        };

        this.connectionStorage
            .storeConnection({
                type: 'http',
                connectionSource: this.walletConnectionSource,
                sessionCrypto
            })
            .then(async () => {
                if (abortController.signal.aborted) {
                    return;
                }

                await callForSuccess(
                    _options =>
                        this.openGateways(sessionCrypto, {
                            openingDeadlineMS:
                                options?.openingDeadlineMS ?? this.defaultOpeningDeadlineMS,
                            signal: _options?.signal,
                            traceId: options.traceId
                        }),
                    {
                        attempts: Number.MAX_SAFE_INTEGER,
                        delayMs: this.defaultRetryTimeoutMS,
                        signal: abortController.signal
                    }
                );
            });
    }

    /**
     * Connects with intent via bridge as a tc:// universal link.
     * connectRequest is at URL level (r param). Intent payload is transported in m/mp params.
     */
    public connectWithIntent(
        payload: WithoutId<RawIntentPayload>,
        options?: OptionalTraceable<{
            connectRequest?: ConnectRequest;
            openingDeadlineMS?: number;
            signal?: AbortSignal;
        }>
    ): Promise<string> {
        const traceId = options?.traceId ?? UUIDv7();

        const intentPayload = { id: '0', ...payload } as RawIntentPayload;

        this.subscribeToBridgeEvents({ ...options, traceId });
        const universalLink = this.obtainUniversalLink();

        this.pendingRequests.set(intentPayload.id.toString(), response => {
            const typed = response as unknown as IntentResponse;
            this.intentListeners.forEach(listener => listener(typed));
        });

        return this.generateUniversalLinkAsync(
            universalLink,
            {
                connectRequest: options?.connectRequest,
                draft: intentPayload
            },
            { traceId, signal: options?.signal }
        );
    }

    private intentListeners: Array<(response: IntentResponse) => void> = [];
    public onIntentResponse(listener: (response: IntentResponse) => void): () => void {
        this.intentListeners.push(listener);

        return () => {
            this.intentListeners = this.intentListeners.filter(l => l !== listener);
        };
    }

    public async restoreConnection(
        options?: OptionalTraceable<{
            openingDeadlineMS?: number;
            signal?: AbortSignal;
        }>
    ): Promise<void> {
        const traceId = options?.traceId ?? UUIDv7();

        const abortController = createAbortController(options?.signal);
        this.abortController?.abort();
        this.abortController = abortController;

        if (abortController.signal.aborted) {
            return;
        }

        this.closeGateways();
        const storedConnection = await this.connectionStorage.getHttpConnection();
        if (!storedConnection) {
            return;
        }

        if (abortController.signal.aborted) {
            return;
        }

        const openingDeadlineMS = options?.openingDeadlineMS ?? this.defaultOpeningDeadlineMS;

        if (isPendingConnectionHttp(storedConnection)) {
            this.session = {
                sessionCrypto: storedConnection.sessionCrypto,
                bridgeUrl:
                    'bridgeUrl' in this.walletConnectionSource
                        ? this.walletConnectionSource.bridgeUrl
                        : ''
            };

            return await this.openGateways(storedConnection.sessionCrypto, {
                openingDeadlineMS: openingDeadlineMS,
                signal: abortController?.signal,
                traceId: options?.traceId
            });
        }

        if (Array.isArray(this.walletConnectionSource)) {
            throw new TonConnectError(
                'Internal error. Connection source is array while WalletConnectionSourceHTTP was expected.'
            );
        }

        this.session = storedConnection.session;

        if (this.gateway) {
            logDebug('Gateway is already opened, closing previous gateway');
            await this.gateway.close();
        }

        this.gateway = new BridgeGateway(
            this.connectionStorage.storage,
            this.walletConnectionSource.bridgeUrl,
            storedConnection.session.sessionCrypto.sessionId,
            this.gatewayListener.bind(this),
            this.gatewayErrorsListener.bind(this),
            this.analyticsManager
        );

        if (abortController.signal.aborted) {
            return;
        }

        // notify listeners about stored connection
        this.listeners.forEach(listener => listener({ ...storedConnection.connectEvent, traceId }));

        // wait for the connection to be opened
        try {
            await callForSuccess(
                options =>
                    this.gateway!.registerSession({
                        openingDeadlineMS: openingDeadlineMS,
                        signal: options.signal,
                        traceId
                    }),
                {
                    attempts: Number.MAX_SAFE_INTEGER,
                    delayMs: this.defaultRetryTimeoutMS,
                    signal: abortController.signal
                }
            );
        } catch (e) {
            await this.disconnect({ signal: abortController.signal, traceId });
            return;
        }
    }

    public sendRequest<T extends RpcMethod>(
        request: WithoutId<AppRequest<T>>,
        options?: OptionalTraceable<{
            attempts?: number;
            onRequestSent?: () => void;
            signal?: AbortSignal;
        }>
    ): Promise<WithoutId<WalletResponse<T>>>;
    /** @deprecated use sendRequest(transaction, options) instead */
    public sendRequest<T extends RpcMethod>(
        request: WithoutId<AppRequest<T>>,
        onRequestSent?: () => void
    ): Promise<WithoutId<WalletResponse<T>>>;
    public sendRequest<T extends RpcMethod>(
        request: WithoutId<AppRequest<T>>,
        optionsOrOnRequestSent?:
            | (() => void)
            | OptionalTraceable<{
                  attempts?: number;
                  onRequestSent?: () => void;
                  signal?: AbortSignal;
              }>
    ): Promise<TraceableWalletResponse<T>> {
        // TODO: remove deprecated method
        const options: OptionalTraceable<{
            onRequestSent?: () => void;
            signal?: AbortSignal;
            attempts?: number;
        }> = {};
        if (typeof optionsOrOnRequestSent === 'function') {
            options.onRequestSent = optionsOrOnRequestSent;
        } else {
            options.onRequestSent = optionsOrOnRequestSent?.onRequestSent;
            options.signal = optionsOrOnRequestSent?.signal;
            options.attempts = optionsOrOnRequestSent?.attempts;
            options.traceId = optionsOrOnRequestSent?.traceId;
        }
        options.traceId ??= UUIDv7();

        return new Promise(async (resolve, reject) => {
            if (!this.gateway || !this.session || !('walletPublicKey' in this.session)) {
                throw new TonConnectError('Trying to send bridge request without session');
            }

            const id = (await this.connectionStorage.getNextRpcRequestId()).toString();
            await this.connectionStorage.increaseNextRpcRequestId();

            const onAbort = (): void => {
                this.pendingRequests.delete(id.toString());
                reject(new TonConnectError('Bridge request was aborted'));
            };

            if (options?.signal?.aborted) {
                onAbort();
                return;
            }

            options?.signal?.addEventListener('abort', onAbort, { once: true });

            logDebug('Send http-bridge request:', { ...request, id });

            const encodedRequest = this.session!.sessionCrypto.encrypt(
                JSON.stringify({ ...request, id }),
                hexToByteArray(this.session.walletPublicKey)
            );

            try {
                this.analytics?.emitBridgeClientMessageSent({
                    bridge_url: this.gateway.bridgeUrl,
                    client_id: this.session.sessionCrypto.sessionId,
                    wallet_id: this.session.walletPublicKey,
                    message_id: id,
                    request_type: request.method,
                    trace_id: options.traceId
                });
                await this.gateway.send(
                    encodedRequest,
                    this.session.walletPublicKey,
                    request.method,
                    {
                        attempts: options?.attempts,
                        signal: options?.signal,
                        traceId: options.traceId
                    }
                );
                options?.onRequestSent?.();
                this.pendingRequests.set(id.toString(), resolve as (response: unknown) => void);
            } catch (e) {
                reject(e);
            }
        });
    }

    public closeConnection(): void {
        this.closeGateways();
        this.listeners = [];
        this.session = null;
        this.gateway = null;
    }

    public async disconnect(options?: OptionalTraceable<{ signal?: AbortSignal }>): Promise<void> {
        const traceId = options?.traceId ?? UUIDv7();
        return new Promise(async resolve => {
            let called = false;
            let timeoutId: ReturnType<typeof setTimeout> | null = null;
            const onRequestSent = (): void => {
                if (!called) {
                    called = true;
                    this.removeBridgeAndSession().then(resolve);
                }
            };

            try {
                this.closeGateways();

                const abortController = createAbortController(options?.signal);
                timeoutId = setTimeout(() => {
                    abortController.abort();
                }, this.defaultOpeningDeadlineMS);

                await this.sendRequest(
                    { method: 'disconnect', params: [] },
                    {
                        onRequestSent: onRequestSent,
                        signal: abortController.signal,
                        attempts: 1,
                        traceId
                    }
                );
            } catch (e) {
                logDebug('Disconnect error:', e);

                if (!called) {
                    this.removeBridgeAndSession().then(resolve);
                }
            } finally {
                if (timeoutId) {
                    clearTimeout(timeoutId);
                }

                onRequestSent();
            }
        });
    }

    public listen(callback: (e: TraceableWalletEvent) => void): () => void {
        this.listeners.push(callback);
        return () => (this.listeners = this.listeners.filter(listener => listener !== callback));
    }

    public pause(): void {
        this.gateway?.pause();
        this.pendingGateways.forEach(bridge => bridge.pause());
    }

    public async unPause(): Promise<void> {
        const promises = this.pendingGateways.map(bridge => bridge.unPause());
        if (this.gateway) {
            promises.push(this.gateway.unPause());
        }
        await Promise.all(promises);
    }

    private async pendingGatewaysListener(
        gateway: BridgeGateway,
        bridgeUrl: string,
        bridgeIncomingMessage: BridgeIncomingMessage
    ): Promise<void> {
        if (!this.pendingGateways.includes(gateway)) {
            await gateway.close();
            return;
        }

        this.closeGateways({ except: gateway });

        if (this.gateway) {
            logDebug('Gateway is already opened, closing previous gateway');
            await this.gateway.close();
        }

        this.session!.bridgeUrl = bridgeUrl;
        this.gateway = gateway;
        this.gateway.setErrorsListener(this.gatewayErrorsListener.bind(this));
        this.gateway.setListener(this.gatewayListener.bind(this));
        return this.gatewayListener(bridgeIncomingMessage);
    }

    private async gatewayListener(bridgeIncomingMessage: BridgeIncomingMessage): Promise<void> {
        const traceId = bridgeIncomingMessage.traceId ?? UUIDv7();
        let walletMessage: WalletMessage;
        try {
            walletMessage = JSON.parse(
                this.session!.sessionCrypto.decrypt(
                    Base64.decode(bridgeIncomingMessage.message).toUint8Array(),
                    hexToByteArray(bridgeIncomingMessage.from)
                )
            );
        } catch (err) {
            this.analytics?.emitBridgeClientMessageDecodeError({
                bridge_url: this.session!.bridgeUrl,
                client_id: this.session!.sessionCrypto.sessionId,
                wallet_id: bridgeIncomingMessage.from,
                error_message: String(err),
                trace_id: bridgeIncomingMessage?.traceId
            });
            throw err;
        }

        logDebug('Wallet message received:', walletMessage);
        const requestType = 'event' in walletMessage ? walletMessage.event : '';
        this.analytics?.emitBridgeClientMessageReceived({
            bridge_url: this.session!.bridgeUrl,
            client_id: this.session!.sessionCrypto.sessionId,
            wallet_id: bridgeIncomingMessage.from,
            message_id: String(walletMessage.id),
            request_type: requestType,
            trace_id: bridgeIncomingMessage?.traceId
        });

        if (!('event' in walletMessage)) {
            const id = walletMessage.id.toString();
            const resolve = this.pendingRequests.get(id);
            if (!resolve) {
                logDebug(`Response id ${id} doesn't match any request's id`);
                return;
            }

            resolve({ ...walletMessage, traceId });
            this.pendingRequests.delete(id);
            return;
        }

        if (walletMessage.id !== undefined) {
            const lastId = await this.connectionStorage.getLastWalletEventId();

            if (lastId !== undefined && walletMessage.id <= lastId) {
                logError(
                    `Received event id (=${walletMessage.id}) must be greater than stored last wallet event id (=${lastId}) `
                );
                return;
            }

            if (walletMessage.event !== 'connect') {
                await this.connectionStorage.storeLastWalletEventId(walletMessage.id);
            }
        }

        // `this.listeners` might be modified in the event handler
        const listeners = this.listeners;

        if (walletMessage.event === 'connect') {
            await this.updateSession(walletMessage, bridgeIncomingMessage.from);
        }

        if (walletMessage.event === 'disconnect') {
            logDebug(`Removing bridge and session: received disconnect event`);
            await this.removeBridgeAndSession();
        }

        listeners.forEach(listener => listener({ ...walletMessage, traceId }));
    }

    private async gatewayErrorsListener(e: Event): Promise<void> {
        throw new TonConnectError(`Bridge error ${JSON.stringify(e)}`);
    }

    private async updateSession(
        connectEvent: ConnectEventSuccess,
        walletPublicKey: string
    ): Promise<void> {
        this.session = {
            ...this.session!,
            walletPublicKey
        };

        const tonAddrItem: TonAddressItemReply = connectEvent.payload.items.find(
            item => item.name === 'ton_addr'
        ) as TonAddressItemReply;

        const connectEventToSave: BridgeConnectionHttp['connectEvent'] = {
            ...connectEvent,
            payload: {
                ...connectEvent.payload,
                items: [tonAddrItem]
            }
        };

        await this.connectionStorage.storeConnection({
            type: 'http',
            session: this.session,
            lastWalletEventId: connectEvent.id,
            connectEvent: connectEventToSave,
            nextRpcRequestId: 0
        });
    }

    private async removeBridgeAndSession(): Promise<void> {
        this.closeConnection();
        await this.connectionStorage.removeConnection();
    }

    private generateUniversalLink(
        universalLink: string,
        message: UniversalLinkMessage,
        options: Traceable<{ signal?: AbortSignal }>
    ): string {
        if (isTelegramUrl(universalLink)) {
            return this.generateTGUniversalLink(universalLink, message, options);
        }

        return this.generateRegularUniversalLink(universalLink, message, options);
    }

    private async generateUniversalLinkAsync(
        universalLink: string,
        message: UniversalLinkMessage,
        options: Traceable<{ signal?: AbortSignal }>
    ): Promise<string> {
        if (isTelegramUrl(universalLink)) {
            return this.generateTGUniversalLinkAsync(universalLink, message, options);
        }

        return this.generateRegularUniversalLinkAsync(universalLink, message, options);
    }

    private async storeIntentPayloadInObjectStorageAsync(
        payload: string,
        options?: { signal?: AbortSignal }
    ): Promise<string> {
        const objectStorageUrl = this.getObjectStorageUrl();
        const url = new URL(objectStorageUrl);
        url.searchParams.set('ttl', BridgeProvider.INTENT_TTL_SECONDS.toString());

        try {
            const response = await fetch(url.toString(), {
                method: 'POST',
                headers: {
                    'Content-Type': 'text/plain'
                },
                body: payload,
                signal: options?.signal
            });

            if (!response.ok) {
                throw new TonConnectError(
                    `Object storage responded with status ${response.status} ${response.statusText}`
                );
            }

            const body = (await response.text()).trim();
            if (!body) {
                throw new TonConnectError('Object storage responded with an empty get_url value');
            }

            try {
                const parsed = JSON.parse(body) as { get_url?: string; getUrl?: string };
                const maybeUrl = parsed.get_url ?? parsed.getUrl;
                if (typeof maybeUrl === 'string' && maybeUrl.trim()) {
                    return maybeUrl.trim();
                }
            } catch {}

            if (body.startsWith('http://') || body.startsWith('https://')) {
                return body;
            }

            const normalized = body.replace(/^\/+/, '');
            return addPathToUrl(objectStorageUrl, normalized);
        } catch (error) {
            this.abortController?.abort();
            logDebug('Failed to store intent payload in object storage', error);
            throw error;
        }
    }

    private getObjectStorageUrl(): string {
        if (
            'objectStorageUrl' in this.walletConnectionSource &&
            this.walletConnectionSource.objectStorageUrl
        ) {
            return this.walletConnectionSource.objectStorageUrl;
        }
        return BridgeProvider.DEFAULT_OBJECT_STORAGE_URL;
    }

    private generateRegularUniversalLink(
        universalLink: string,
        message: UniversalLinkMessage,
        options: Traceable<{ signal?: AbortSignal }>
    ): string {
        const baseUrl = new URL(universalLink);
        baseUrl.searchParams.append('v', PROTOCOL_VERSION.toString());
        baseUrl.searchParams.append('id', this.session!.sessionCrypto.sessionId);
        baseUrl.searchParams.append('trace_id', options.traceId);

        if (message.connectRequest) {
            baseUrl.searchParams.append('r', JSON.stringify(message.connectRequest));
        }

        return baseUrl.toString();
    }

    private async generateRegularUniversalLinkAsync(
        universalLink: string,
        message: UniversalLinkMessage,
        options: Traceable<{ signal?: AbortSignal }>
    ): Promise<string> {
        const baseUrl = new URL(universalLink);
        baseUrl.searchParams.append('v', PROTOCOL_VERSION.toString());
        baseUrl.searchParams.append('id', this.session!.sessionCrypto.sessionId);
        baseUrl.searchParams.append('trace_id', options.traceId);

        if (message.connectRequest) {
            baseUrl.searchParams.append('r', JSON.stringify(message.connectRequest));
        }

        if (message.draft) {
            const intentPayload = message.draft;

            const inlineUrl = new URL(baseUrl.toString());
            const mp = toBase64Url(Base64.encode(intentPayload, false));
            inlineUrl.searchParams.append('m', 'intent');
            inlineUrl.searchParams.append('mp', mp);

            const inlineUrlString = inlineUrl.toString();
            if (inlineUrlString.length <= BridgeProvider.MAX_INLINE_INTENT_URL_LENGTH) {
                return inlineUrlString;
            }

            const shortUrl = new URL(baseUrl.toString());
            const sessionCrypto = new SessionCrypto();

            shortUrl.searchParams.append('m', 'intent_remote');
            shortUrl.searchParams.append('pk', sessionCrypto.stringifyKeypair().secretKey);

            const encryptedPayloadRaw = sessionCrypto.encrypt(
                JSON.stringify(intentPayload),
                hexToByteArray(sessionCrypto.sessionId)
            );
            const encryptedPayload = Base64.encode(encryptedPayloadRaw);

            const getUrl = await this.storeIntentPayloadInObjectStorageAsync(encryptedPayload, {
                signal: options.signal
            });

            shortUrl.searchParams.append('get_url', getUrl);

            return shortUrl.toString();
        }

        return baseUrl.toString();
    }

    private async generateTGUniversalLinkAsync(
        universalLink: string,
        message: UniversalLinkMessage,
        options: Traceable<{ signal?: AbortSignal }>
    ): Promise<string> {
        const urlToWrap = await this.generateRegularUniversalLinkAsync(
            'about:blank',
            message,
            options
        );
        const linkParams = urlToWrap.split('?')[1]!;

        const startapp = 'tonconnect-' + encodeTelegramUrlParameters(linkParams);

        // TODO: Remove this line after all dApps and the wallets-list.json have been updated
        const updatedUniversalLink = this.convertToDirectLink(universalLink);

        const url = new URL(updatedUniversalLink);
        url.searchParams.append('startapp', startapp);
        return url.toString();
    }

    private generateTGUniversalLink(
        universalLink: string,
        message: UniversalLinkMessage,
        options: Traceable<{ signal?: AbortSignal }>
    ): string {
        const urlToWrap = this.generateRegularUniversalLink('about:blank', message, options);
        const linkParams = urlToWrap.split('?')[1]!;

        const startapp = 'tonconnect-' + encodeTelegramUrlParameters(linkParams);

        // TODO: Remove this line after all dApps and the wallets-list.json have been updated
        const updatedUniversalLink = this.convertToDirectLink(universalLink);

        const url = new URL(updatedUniversalLink);
        url.searchParams.append('startapp', startapp);
        return url.toString();
    }

    // TODO: Remove this method after all dApps and the wallets-list.json have been updated
    private convertToDirectLink(universalLink: string): string {
        const url = new URL(universalLink);

        if (url.searchParams.has('attach')) {
            url.searchParams.delete('attach');
            url.pathname += '/start';
        }

        return url.toString();
    }

    private async openGateways(
        sessionCrypto: SessionCrypto,
        options?: OptionalTraceable<{
            openingDeadlineMS?: number;
            signal?: AbortSignal;
        }>
    ): Promise<void> {
        const traceId = options?.traceId ?? UUIDv7();
        if (Array.isArray(this.walletConnectionSource)) {
            // close all gateways before opening new ones
            this.pendingGateways.map(bridge => bridge.close().catch());

            // open new gateways
            this.pendingGateways = this.walletConnectionSource.map(source => {
                const gateway = new BridgeGateway(
                    this.connectionStorage.storage,
                    source.bridgeUrl,
                    sessionCrypto.sessionId,
                    () => {},
                    () => {},
                    this.analyticsManager
                );

                gateway.setListener(message =>
                    this.pendingGatewaysListener(gateway, source.bridgeUrl, message)
                );

                return gateway;
            });

            // Wait until the specified optional gateways are opened, not necessarily all gateways
            const gatewaysToWaitFor = Math.max(
                this.pendingGateways.length - this.optionalOpenGateways,
                1
            );

            await waitForSome(
                this.pendingGateways.map(bridge =>
                    callForSuccess(
                        (_options): Promise<void> => {
                            if (!this.pendingGateways.some(item => item === bridge)) {
                                return bridge.close();
                            }

                            return bridge.registerSession({
                                openingDeadlineMS:
                                    options?.openingDeadlineMS ?? this.defaultOpeningDeadlineMS,
                                signal: _options.signal,
                                traceId
                            });
                        },
                        {
                            attempts: Number.MAX_SAFE_INTEGER,
                            delayMs: this.defaultRetryTimeoutMS,
                            signal: options?.signal
                        }
                    )
                ),
                gatewaysToWaitFor
            );

            return;
        } else {
            if (this.gateway) {
                logDebug(`Gateway is already opened, closing previous gateway`);
                await this.gateway.close();
            }

            this.gateway = new BridgeGateway(
                this.connectionStorage.storage,
                this.walletConnectionSource.bridgeUrl,
                sessionCrypto.sessionId,
                this.gatewayListener.bind(this),
                this.gatewayErrorsListener.bind(this),
                this.analyticsManager
            );
            return await this.gateway.registerSession({
                openingDeadlineMS: options?.openingDeadlineMS,
                signal: options?.signal,
                traceId
            });
        }
    }

    private closeGateways(options?: { except: BridgeGateway }): void {
        this.gateway?.close();
        this.pendingGateways
            .filter(item => item !== options?.except)
            .forEach(bridge => bridge.close());
        this.pendingGateways = [];
    }
}
