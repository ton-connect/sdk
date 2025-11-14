import {
    AppRequest,
    CHAIN,
    ConnectItemReply,
    ConnectRequest,
    DeviceInfo,
    DISCONNECT_ERROR_CODES,
    DisconnectRpcResponseSuccess,
    RpcMethod,
    SendTransactionRpcResponseSuccess,
    SignDataPayload,
    SignDataRpcResponseSuccess,
    TonProofItemReplySuccess
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
import { parseUserFriendlyAddress, toRawAddress } from 'src/utils/address';
import {
    getUniversalConnector,
    getWalletConnectOptions
} from 'src/provider/wallet-connect/initialize';
import { logDebug } from 'src/utils/log';

export class WalletConnectProvider implements InternalProvider {
    public readonly type = 'injected';

    private listeners: Array<(e: TraceableWalletEvent) => void> = [];

    private connector: UniversalConnector | undefined = undefined;

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
                        }
                        // {
                        //     id: -3,
                        //     chainNamespace: 'ton' as const,
                        //     caipNetworkId: 'ton:-3',
                        //     name: 'TON',
                        //     nativeCurrency: { name: 'TON', symbol: 'TON', decimals: 9 },
                        //     rpcUrls: { default: { http: ['https://testnet.ton.org'] } }
                        // }
                    ], // Array of available networks for the namespace
                    methods: ['ton_sendMessage', 'ton_signData'], // Methods to be handled by the relay connection
                    events: [] // Events to be handled by the relay connection
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

    connect(message: ConnectRequest, options?: OptionalTraceable) {
        const traceId = options?.traceId ?? UUIDv7();
        this._connect(message, { traceId });
    }

    async _connect(message: ConnectRequest, options: Traceable) {
        const connector = await this.initialize();

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
        await connector.connect({ authentication });

        logDebug('Connected through this.connector.connect');

        await this.onConnect(connector, options);
    }

    async restoreConnection(
        options?: OptionalTraceable<{ openingDeadlineMS?: number; signal?: AbortSignal }>
    ): Promise<void> {
        try {
            logDebug('Restoring WalletConnect connection...');
            const traceId = options?.traceId ?? UUIDv7();

            const storedConnection = await this.connectionStorage.getWalletConnectConnection();
            if (!storedConnection) {
                return;
            }

            const connector = await this.initialize();

            connector.provider.session =
                storedConnection.session as typeof connector.provider.session;

            await this.onConnect(connector, { traceId });
            logDebug('WalletConnect successfully restored.');
        } catch (error) {
            console.error(error);
        }
    }

    closeConnection(): void {
        void this?.disconnect();
    }

    async disconnect(_options?: OptionalTraceable<{ signal?: AbortSignal }>): Promise<void> {
        await this.connectionStorage.removeConnection();
        await this.connector?.disconnect();
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
        _optionsOrOnRequestSent?:
            | (() => void)
            | OptionalTraceable<{
                  attempts?: number;
                  onRequestSent?: () => void;
                  signal?: AbortSignal;
              }>
    ): Promise<TraceableWalletResponse<T>> {
        if (!this.connector) {
            throw new Error('NOT CONNECTED');
        }

        // let request: RequestArguments; TODO: export
        if (request.method === 'sendTransaction') {
            const { network, ...sendTransactionPayload } = JSON.parse(request.params[0]!);
            // TODO: extra currencies not supported yet
            const result = await this.connector?.request(
                {
                    method: 'ton_sendMessage',
                    params: sendTransactionPayload
                },
                `ton:${network}`
            );
            console.log('Send transaction result', result);

            return {
                id: '0',
                traceId: UUIDv7(), // TODO
                result
            } as Traceable<SendTransactionRpcResponseSuccess>;
        } else if (request.method === 'signData') {
            const { network, ...signDataPayload } = JSON.parse(
                request.params[0]!
            ) as SignDataPayload;

            const result = await this.connector.request(
                {
                    method: 'ton_signData',
                    params: signDataPayload
                },
                `ton:${network}`
            );

            return {
                id: '0',
                traceId: UUIDv7(), // TODO
                result
            } as Traceable<SignDataRpcResponseSuccess>;
        } else if (request.method === 'disconnect') {
            return { id: '0', traceId: UUIDv7() } as Traceable<DisconnectRpcResponseSuccess>;
        }

        return {
            id: '0',
            error: { code: DISCONNECT_ERROR_CODES.UNKNOWN_ERROR, message: 'Not implemented.' },
            traceId: ''
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

    private async onConnect(connector: UniversalConnector, options: Traceable) {
        const session = connector.provider.session!;
        const peer = session.peer;

        const tonNamespace = session.namespaces['ton'];
        if (!tonNamespace?.accounts?.[0]) {
            await this.disconnect();
            throw new TonConnectError('Connection error. No TON accounts connected ');
        }

        const account = tonNamespace.accounts[0];
        const [, network, address] = account.split(':', 3);

        const publicKey = session.sessionProperties?.ton_getPublicKey;

        if (!publicKey) {
            await this.disconnect();
            throw new TonConnectError(
                'Connection error. No sessionProperties.ton_getPublicKey provided. '
            );
        }

        const stateInit = session.sessionProperties?.ton_getStateInit;
        if (!stateInit) {
            await this.disconnect();
            throw new TonConnectError(
                'Connection error. No sessionProperties.ton_getStateInit provided. '
            );
        }

        const tonProof = this.buildTonProof(connector);

        const payload: {
            items: ConnectItemReply[];
            device: DeviceInfo;
        } = {
            items: [
                {
                    name: 'ton_addr',
                    // TODO: maybe shoud be raw address by protocol?
                    address: toRawAddress(parseUserFriendlyAddress(address!)),
                    network: network as CHAIN, // TODO, probably should pass network on connect, would be in protocol in the near future,
                    publicKey,
                    walletStateInit: stateInit
                },
                ...(tonProof ? [tonProof] : [])
            ],
            device: {
                appName: peer.metadata.name,
                appVersion: '', // TODO
                maxProtocolVersion: 2, // TODO
                features: [
                    { name: 'SendTransaction', maxMessages: 255, extraCurrencySupported: true },
                    { name: 'SignData', types: ['text', 'binary', 'cell'] }
                ], // TODO
                platform: 'mac' // TODO
            }
        };

        await this.storeConnection();

        this.listeners.forEach(listener =>
            listener({ event: 'connect', payload, traceId: options.traceId })
        );
    }

    private storeConnection(): Promise<void> {
        return this.connectionStorage.storeConnection({
            type: 'wallet-connect',
            session: this.connector?.provider.session
        });
    }
}
