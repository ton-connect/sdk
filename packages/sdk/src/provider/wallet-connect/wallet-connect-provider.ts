import {
    AppRequest,
    CHAIN,
    ConnectItemReply,
    ConnectRequest,
    DeviceInfo,
    DISCONNECT_ERROR_CODES,
    RpcMethod,
    SignDataPayload
} from '@tonconnect/protocol';
import { TraceableWalletEvent, TraceableWalletResponse } from 'src/models/wallet/traceable-events';
import { OptionalTraceable, Traceable, WithoutId } from 'src/utils/types';
import { UniversalConnector, UniversalConnectorConfig } from '@reown/appkit-universal-connector';
import { UUIDv7 } from 'src/utils/uuid';
import { InternalProvider } from 'src/provider/provider';
import { DappMetadata } from 'src/models';
import { IStorage } from 'src/storage/models/storage.interface';
import { BridgeConnectionStorage } from 'src/storage/bridge-connection-storage';
import { TonConnectError } from 'src/errors';
import { parseUserFriendlyAddress, toRawAddress } from 'src/utils/address';

export class WalletConnectProvider implements InternalProvider {
    public readonly type = 'injected';

    private listeners: Array<(e: TraceableWalletEvent) => void> = [];

    private connector: UniversalConnector | undefined = undefined;

    private readonly connectionStorage: BridgeConnectionStorage;

    private readonly config: UniversalConnectorConfig;

    constructor(
        private readonly storage: IStorage,
        private readonly projectKey: string,
        private readonly metadata: DappMetadata
    ) {
        this.connectionStorage = new BridgeConnectionStorage(storage);

        this.config = {
            networks: [
                {
                    namespace: 'ton', // CAIP-2 Namespace. In this case: 'ton'
                    chains: [
                        // TODO: deal with chains
                        {
                            id: -239,

                            // TODO fixme
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            chainNamespace: 'ton' as any, // TODO

                            // TODO fixme
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            caipNetworkId: 'ton:-239' as any, // TODO
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
            projectId: this.projectKey,
            metadata: {
                url: this.metadata.url,
                icons: [this.metadata.icon],
                name: this.metadata.name,
                description: 'DESCRIPTION'
            }
        };
    }

    public static async fromStorage(storage: IStorage): Promise<WalletConnectProvider> {
        const bridgeConnectionStorage = new BridgeConnectionStorage(storage);
        // TODO: probably it is better to extract projectKey and metadata from tonconnect setting to allow DApp to change
        const connection = await bridgeConnectionStorage.getWalletConnectConnection();
        return new WalletConnectProvider(storage, connection.projectKey, connection.metadata);
    }

    private async initialize(): Promise<UniversalConnector> {
        if (!this.connector) {
            this.connector = await UniversalConnector.init(this.config);
        }

        return this.connector;
    }

    connect(message: ConnectRequest, options?: OptionalTraceable) {
        const traceId = options?.traceId ?? UUIDv7();
        this._connect(message, { traceId });
    }

    async _connect(message: ConnectRequest, options: Traceable) {
        const connector = await this.initialize();

        console.log(message.items);
        const tonProof = message.items.find(item => item.name === 'ton_proof');
        const authentication = tonProof
            ? [
                  {
                      domain: 'TODO',
                      chains: ['ton:-239'],
                      nonce: tonProof.payload,
                      uri: 'TODO',
                      ttl: 0,
                      statement: 'ton_proof'
                  }
              ]
            : undefined;
        console.log('Connecting through this.connector.connect', { authentication });
        await connector.connect({ authentication });

        console.log('Connected through this.connector.connect');

        await this.onConnect(connector, options);
    }

    async restoreConnection(
        options?: OptionalTraceable<{ openingDeadlineMS?: number; signal?: AbortSignal }>
    ): Promise<void> {
        try {
            console.log('RECONNECTING');
            const traceId = options?.traceId ?? UUIDv7();

            const storedConnection = await this.connectionStorage.getWalletConnectConnection();
            if (!storedConnection) {
                return;
            }

            const connector = await this.initialize();

            connector.provider.session =
                storedConnection.session as typeof connector.provider.session;

            await this.onConnect(connector, { traceId });
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
            } as any;
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
            console.log('Sign data result', result);
            return {
                id: '0',
                traceId: UUIDv7(), // TODO
                result
            } as any;
        } else {
            return {
                id: '0',
                error: { code: DISCONNECT_ERROR_CODES.UNKNOWN_ERROR, message: 'Not implemented.' },
                traceId: ''
            };
        }
    }

    public listen(callback: (e: TraceableWalletEvent) => void): () => void {
        this.listeners.push(callback);
        return () => (this.listeners = this.listeners.filter(listener => listener !== callback));
    }

    private async onConnect(connector: UniversalConnector, options: Traceable) {
        const session = connector.provider.session!;
        const peer = session.peer;

        const tonNamespace = session.namespaces['ton'];
        if (!tonNamespace?.accounts?.[0]) {
            await this.disconnect();
            throw new TonConnectError('Connection error. No TON accounts connected ');
        }

        console.log('AUTH', session.authentication);

        const account = tonNamespace.accounts[0];
        const [, network, address] = account.split(':', 3);

        console.log('PROPS', Object.keys(session.sessionProperties as any));
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
                    publicKey: peer.publicKey,
                    // TODO
                    walletStateInit:
                        'e6ccgECFgEAAwQAAgE0AQIBFP8A9KQT9LzyyAsDAFEAAAAAKamjFzQ9VeXB3VooMYjIYZy+03OLkpPWM+SfL27jB85G8eL1QAIBIAQFAgFIBgcE+PKDCNcYINMf0x/THwL4I7vyZO1E0NMf0x/T//QE0VFDuvKhUVG68qIF+QFUEGT5EPKj+AAkpMjLH1JAyx9SMMv/UhD0AMntVPgPAdMHIcAAn2xRkyDXSpbTB9QC+wDoMOAhwAHjACHAAuMAAcADkTDjDQOkyMsfEssfy/8SExQVAubQAdDTAyFxsJJfBOAi10nBIJJfBOAC0x8hghBwbHVnvSKCEGRzdHK9sJJfBeAD+kAwIPpEAcjKB8v/ydDtRNCBAUDXIfQEMFyBAQj0Cm+hMbOSXwfgBdM/yCWCEHBsdWe6kjgw4w0DghBkc3RyupJfBuMNCAkCASAKCwB4AfoA9AQw+CdvIjBQCqEhvvLgUIIQcGx1Z4MesXCAGFAEywUmzxZY+gIZ9ADLaRfLH1Jgyz8gyYBA+wAGAIpQBIEBCPRZMO1E0IEBQNcgyAHPFvQAye1UAXKwjiOCEGRzdHKDHrFwgBhQBcsFUAPPFiP6AhPLassfyz/JgED7AJJfA+ICASAMDQBZvSQrb2omhAgKBrkPoCGEcNQICEekk30pkQzmkD6f+YN4EoAbeBAUiYcVnzGEAgFYDg8AEbjJftRNDXCx+AA9sp37UTQgQFA1yH0BDACyMoHy//J0AGBAQj0Cm+hMYAIBIBARABmtznaiaEAga5Drhf/AABmvHfaiaEAQa5DrhY/AAG7SB/oA1NQi+QAFyMoHFcv/ydB3dIAYyMsFywIizxZQBfoCFMtrEszMyXP7AMhAFIEBCPRR8qcCAHCBAQjXGPoA0z/IVCBHgQEI9FHyp4IQbm90ZXB0gBjIywXLAlAGzxZQBPoCFMtqEssfyz/Jc/sAAgBsgQEI1xj6ANM/MFIkgQEI9Fnyp4IQZHN0cnB0gBjIywXLAlAFzxZQA/oCE8tqyx8Syz/Jc/sAAAr0AMntVA==' // TODO
                },
                // TODO
                {
                    name: 'ton_proof',
                    proof: {
                        timestamp: Date.now(),
                        domain: {
                            lengthBytes: 1,
                            value: 'a'
                        },
                        payload: 'a',
                        signature: 'YW55'
                    }
                }
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
        console.log('STORED');
        return this.connectionStorage.storeConnection({
            type: 'wallet-connect',
            projectKey: this.projectKey,
            metadata: this.metadata,
            session: this.connector?.provider.session
        });
    }
}
