import {
    AppRequest,
    CHAIN,
    CONNECT_EVENT_ERROR_CODES,
    ConnectItemReply,
    ConnectRequest,
    DeviceInfo,
    DISCONNECT_ERROR_CODES,
    DisconnectRpcResponseSuccess,
    RpcMethod,
    SEND_TRANSACTION_ERROR_CODES,
    SendTransactionRpcResponseSuccess,
    SignDataRpcResponseSuccess,
    TonProofItemReplySuccess,
    WalletResponseTemplateError
} from '@tonconnect/protocol';
import { TraceableWalletEvent, TraceableWalletResponse } from 'src/models/wallet/traceable-events';
import { OptionalTraceable, Traceable, WithoutId } from 'src/utils/types';
import type {
    UniversalConnector,
    UniversalConnectorConfig
} from '@reown/appkit-universal-connector';
import { UUIDv7 } from 'src/utils/uuid';
import { InternalProvider } from 'src/provider/provider';
import { IStorage } from 'src/storage/models/storage.interface';
import { BridgeConnectionStorage } from 'src/storage/bridge-connection-storage';
import { TonConnectError } from 'src/errors';
import {
    isValidUserFriendlyAddress,
    parseUserFriendlyAddress,
    toRawAddress
} from 'src/utils/address';
import {
    getUniversalConnector,
    getWalletConnectOptions
} from 'src/provider/wallet-connect/initialize';
import { logDebug } from 'src/utils/log';
import { createAbortController } from 'src/utils/create-abort-controller';

const DEFAULT_REQUEST_ID = '0';
const DEFAULT_EVENT_ID = 0;

export class WalletConnectProvider implements InternalProvider {
    public readonly type = 'injected';

    private listeners: Array<(e: TraceableWalletEvent) => void> = [];

    private connector: UniversalConnector | undefined = undefined;

    private abortController?: AbortController;

    private readonly connectionStorage: BridgeConnectionStorage;

    private readonly config: UniversalConnectorConfig;

    constructor(storage: IStorage) {
        this.connectionStorage = new BridgeConnectionStorage(storage);

        const { projectId, metadata } = getWalletConnectOptions();

        this.config = {
            networks: [
                {
                    namespace: 'ton',
                    chains: [
                        {
                            id: -239,
                            chainNamespace: 'ton',
                            caipNetworkId: 'ton:-239',
                            name: 'TON',
                            nativeCurrency: { name: 'TON', symbol: 'TON', decimals: 9 },
                            rpcUrls: { default: { http: ['https://mainnet.ton.org'] } }
                        },
                        {
                            id: -3,
                            chainNamespace: 'ton',
                            caipNetworkId: 'ton:-3',
                            name: 'TON',
                            nativeCurrency: { name: 'TON', symbol: 'TON', decimals: 9 },
                            rpcUrls: { default: { http: ['https://testnet.ton.org'] } }
                        }
                    ],
                    methods: ['ton_sendMessage', 'ton_signData'],
                    events: []
                }
            ],
            projectId,
            metadata
        };
    }

    public static async fromStorage(storage: IStorage): Promise<WalletConnectProvider> {
        return new WalletConnectProvider(storage);
    }

    private async initialize(): Promise<UniversalConnector> {
        if (!this.connector) {
            this.connector = await getUniversalConnector().init(this.config);
        }

        return this.connector;
    }

    connect(message: ConnectRequest, options?: OptionalTraceable<{ signal?: AbortSignal }>): void {
        const traceId = options?.traceId ?? UUIDv7();
        const abortController = createAbortController(options?.signal);
        this.abortController?.abort();
        this.abortController = abortController;

        void this._connect(message, {
            traceId,
            signal: abortController.signal,
            abortController
        }).catch(error => logDebug('WalletConnect connect unexpected error', error));
    }

    async _connect(
        message: ConnectRequest,
        options: Traceable<{ signal?: AbortSignal; abortController: AbortController }>
    ) {
        const connector = await this.initialize();

        if (options.signal?.aborted) {
            logDebug('WalletConnect connect aborted before start');
            this.clearAbortController(options.abortController);
            return;
        }

        const tonProof = message.items.find(item => item.name === 'ton_proof');

        const authentication = tonProof
            ? [
                  {
                      domain: new URL(this.config.metadata.url).hostname,
                      chains: ['ton:-239'],
                      nonce: '',
                      uri: 'ton_proof',
                      ttl: 0,
                      statement: tonProof.payload
                  }
              ]
            : undefined;
        logDebug('Connecting through this.connector.connect');

        try {
            await connector.connect({ authentication });
        } catch (error) {
            if (options.signal?.aborted) {
                logDebug('WalletConnect connect aborted via signal');
                this.clearAbortController(options.abortController);
                return;
            }

            logDebug('WalletConnect connect error', error);
            const event = {
                id: DEFAULT_EVENT_ID,
                event: 'connect_error',
                traceId: options.traceId,
                payload: {
                    code: CONNECT_EVENT_ERROR_CODES.USER_REJECTS_ERROR,
                    message: 'User declined the connection'
                }
            } as const;

            logDebug('WalletConnect connect response:', event);
            this.emit(event);
            this.clearAbortController(options.abortController);
            return;
        }

        logDebug('Connected through this.connector.connect');

        try {
            await this.onConnect(connector, options);
        } catch (error) {
            logDebug('WalletConnect onConnect error', error);
            await this.disconnect({ traceId: options.traceId, signal: options.signal });
        } finally {
            this.clearAbortController(options.abortController);
        }
    }

    async restoreConnection(
        options?: OptionalTraceable<{ openingDeadlineMS?: number; signal?: AbortSignal }>
    ): Promise<void> {
        const traceId = options?.traceId ?? UUIDv7();
        const abortController = createAbortController(options?.signal);
        this.abortController?.abort();
        this.abortController = abortController;

        if (abortController.signal.aborted) {
            return;
        }

        try {
            logDebug('Restoring WalletConnect connection...');
            const storedConnection = await this.connectionStorage.getWalletConnectConnection();
            if (!storedConnection || abortController.signal.aborted) {
                return;
            }

            const connector = await this.initialize();
            if (abortController.signal.aborted) {
                return;
            }

            await this.onConnect(connector, {
                traceId,
                signal: abortController.signal
            });
            logDebug('WalletConnect successfully restored.');
        } catch (error) {
            logDebug('WalletConnect restore error', error);
            await this.disconnect({ traceId, signal: abortController.signal });
        } finally {
            this.clearAbortController(abortController);
        }
    }

    closeConnection(): void {
        this.abortController?.abort();
        this.abortController = undefined;
        void this.disconnect();
    }

    async disconnect(options?: OptionalTraceable<{ signal?: AbortSignal }>): Promise<void> {
        const abortController = createAbortController(options?.signal);
        this.abortController?.abort();
        this.abortController = abortController;

        if (abortController.signal.aborted) {
            return;
        }

        try {
            await this.connectionStorage.removeConnection();
            if (abortController.signal.aborted) {
                return;
            }
            await this.connector?.disconnect();
        } catch (error) {
            logDebug('WalletConnect disconnect error', error);
        } finally {
            this.clearAbortController(abortController);
        }
    }

    sendRequest<T extends RpcMethod>(
        request: WithoutId<AppRequest<T>>,
        options?: OptionalTraceable<{
            onRequestSent?: () => void;
            signal?: AbortSignal;
            attempts?: number;
        }>
    ): Promise<TraceableWalletResponse<T>>;
    sendRequest<T extends RpcMethod>(
        request: WithoutId<AppRequest<T>>,
        onRequestSent?: () => void
    ): Promise<TraceableWalletResponse<T>>;
    async sendRequest<T extends RpcMethod>(
        request: WithoutId<AppRequest<T>>,
        optionsOrOnRequestSent?:
            | (() => void)
            | OptionalTraceable<{
                  attempts?: number;
                  onRequestSent?: () => void;
                  signal?: AbortSignal;
              }>
    ): Promise<TraceableWalletResponse<T>> {
        if (!this.connector) {
            throw new TonConnectError('Wallet Connect not initialized');
        }

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

        try {
            if (options.signal?.aborted) {
                throw new TonConnectError('WalletConnect request aborted');
            }

            logDebug('Send wallet-connect request:', { ...request, id: DEFAULT_REQUEST_ID });

            if (request.method === 'sendTransaction') {
                const { network, ...sendTransactionPayload } = JSON.parse(request.params[0]!);

                const promise = this.connector!.request(
                    {
                        method: 'ton_sendMessage',
                        params: sendTransactionPayload
                    },
                    `ton:${network}`
                );

                options?.onRequestSent?.();

                const result = (await promise) as WithoutId<SendTransactionRpcResponseSuccess>;
                logDebug('Wallet message received:', { result, id: DEFAULT_REQUEST_ID });

                return {
                    result,
                    id: DEFAULT_REQUEST_ID,
                    traceId: options.traceId
                };
            } else if (request.method === 'signData') {
                const { network, ...signDataPayload } = JSON.parse(request.params[0]!);

                const promise = this.connector!.request(
                    {
                        method: 'ton_signData',
                        params: signDataPayload
                    },
                    `ton:${network}`
                );

                options?.onRequestSent?.();

                const result = (await promise) as WithoutId<SignDataRpcResponseSuccess>;

                logDebug('Wallet message received:', { result, id: DEFAULT_REQUEST_ID });

                return { result, traceId: options.traceId, id: DEFAULT_REQUEST_ID };
            } else if (request.method === 'disconnect') {
                return {
                    id: DEFAULT_REQUEST_ID,
                    traceId: options.traceId
                } as Traceable<DisconnectRpcResponseSuccess>;
            }
        } catch (error) {
            logDebug('WalletConnect request error', error, error.stack);
            const result = (await this.handleWalletConnectError(error, {
                traceId: options.traceId
            })) as TraceableWalletResponse<T>;

            logDebug('Wallet message received:', result);

            return result;
        }

        return {
            id: DEFAULT_REQUEST_ID,
            error: { code: DISCONNECT_ERROR_CODES.UNKNOWN_ERROR, message: 'Not implemented.' },
            traceId: options.traceId
        };
    }

    private async handleWalletConnectError(
        error: unknown,
        options: Traceable
    ): Promise<Traceable<WalletResponseTemplateError>> {
        if (typeof error === 'object' && error !== null) {
            const message = String(
                'message' in error ? error.message : 'msg' in error ? error.msg : error
            );

            if (message.toLowerCase().includes('reject')) {
                return {
                    id: DEFAULT_REQUEST_ID,
                    traceId: options.traceId,
                    error: {
                        code: SEND_TRANSACTION_ERROR_CODES.USER_REJECTS_ERROR,
                        message
                    }
                };
            }
            if (message.toLowerCase().includes('tonvalidationerror')) {
                return {
                    id: DEFAULT_REQUEST_ID,
                    traceId: options.traceId,
                    error: {
                        code: SEND_TRANSACTION_ERROR_CODES.BAD_REQUEST_ERROR,
                        message
                    }
                };
            }

            return {
                id: DEFAULT_REQUEST_ID,
                traceId: options.traceId,
                error: {
                    code: SEND_TRANSACTION_ERROR_CODES.UNKNOWN_ERROR,
                    message
                }
            };
        }

        return {
            id: DEFAULT_REQUEST_ID,
            traceId: options.traceId,
            error: {
                code: SEND_TRANSACTION_ERROR_CODES.UNKNOWN_ERROR,
                message: String(error)
            }
        };
    }

    public listen(callback: (e: TraceableWalletEvent) => void): () => void {
        this.listeners.push(callback);
        return () => (this.listeners = this.listeners.filter(listener => listener !== callback));
    }

    private buildTonProof(connector: UniversalConnector): TonProofItemReplySuccess | undefined {
        const auth = connector.provider.session!.authentication?.[0];
        const iat = auth?.p?.iat;
        const statement = auth?.p?.statement;

        if (!iat || !statement) {
            return;
        }

        const domain = auth.p.domain;
        return {
            name: 'ton_proof',
            proof: {
                timestamp: Math.floor(new Date(iat).getTime() / 1000),
                domain: {
                    lengthBytes: domain.length,
                    value: domain
                },
                payload: statement,
                signature: auth.s.s
            }
        } as const;
    }

    private async onConnect(
        connector: UniversalConnector,
        options: Traceable<{ signal?: AbortSignal }>
    ) {
        if (options.signal?.aborted) {
            logDebug('WalletConnect onConnect aborted');
            return;
        }

        const session = connector.provider.session!;

        const tonNamespace = session.namespaces['ton'];
        if (!tonNamespace?.accounts?.[0]) {
            await this.disconnectWithError({
                traceId: options.traceId,
                code: CONNECT_EVENT_ERROR_CODES.BAD_REQUEST_ERROR,
                message: 'Connection error. No TON accounts connected.'
            });
            return;
        }

        const account = tonNamespace.accounts[0];
        const [, network, address] = account.split(':', 3);

        const publicKey = session.sessionProperties?.ton_getPublicKey;

        if (!publicKey) {
            await this.disconnectWithError({
                traceId: options.traceId,
                code: CONNECT_EVENT_ERROR_CODES.BAD_REQUEST_ERROR,
                message: 'Connection error. No sessionProperties.ton_getPublicKey provided.'
            });
            return;
        }

        const stateInit = session.sessionProperties?.ton_getStateInit;
        if (!stateInit) {
            await this.disconnectWithError({
                traceId: options.traceId,
                code: CONNECT_EVENT_ERROR_CODES.BAD_REQUEST_ERROR,
                message: 'Connection error. No sessionProperties.ton_getStateInit provided.'
            });

            return;
        }

        connector.provider.once('session_delete', async () => {
            try {
                await this.connectionStorage.removeConnection();
                const event = {
                    event: 'disconnect',
                    traceId: UUIDv7(),
                    payload: {}
                } as const;
                logDebug('Wallet message received:', event);
                this.emit(event);
            } catch {}
        });

        const tonProof = this.buildTonProof(connector);

        const parsedAddress = isValidUserFriendlyAddress(address!)
            ? toRawAddress(parseUserFriendlyAddress(address!))
            : address!;

        const payload: {
            items: ConnectItemReply[];
            device: DeviceInfo;
        } = {
            items: [
                {
                    name: 'ton_addr',
                    address: parsedAddress,
                    network: network as CHAIN,
                    publicKey,
                    walletStateInit: stateInit
                },
                ...(tonProof ? [tonProof] : [])
            ],
            device: {
                appName: 'wallet_connect',
                appVersion: '',
                maxProtocolVersion: 2,
                features: [
                    'SendTransaction',
                    { name: 'SendTransaction', maxMessages: 255, extraCurrencySupported: true },
                    { name: 'SignData', types: ['text', 'binary', 'cell'] }
                ],
                platform: 'browser'
            }
        };

        logDebug('WalletConnect connect response:', {
            event: 'connect',
            payload,
            id: DEFAULT_EVENT_ID
        });

        this.emit({ event: 'connect', payload, traceId: options.traceId });

        await this.storeConnection();
    }

    private async disconnectWithError(
        options: Traceable<{ code: CONNECT_EVENT_ERROR_CODES; message: string }>
    ): Promise<void> {
        await this.disconnect();

        const payload = {
            code: options.code,
            message: options.message
        };

        logDebug('WalletConnect connect response:', {
            event: 'connect_error',
            id: DEFAULT_EVENT_ID,
            payload
        });

        this.emit({
            event: 'connect_error',
            traceId: options.traceId,
            payload
        });
    }

    private clearAbortController(abortController: AbortController): void {
        if (this.abortController === abortController) {
            this.abortController = undefined;
        }
    }

    private emit(event: TraceableWalletEvent, listeners?: typeof this.listeners) {
        (listeners ?? this.listeners).forEach(listener => listener(event));
    }

    private storeConnection(): Promise<void> {
        return this.connectionStorage.storeConnection({
            type: 'wallet-connect'
        });
    }
}
