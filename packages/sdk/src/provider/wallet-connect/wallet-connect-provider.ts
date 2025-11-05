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

export class WalletConnectProvider implements InternalProvider {
    public readonly type = 'injected';

    private listeners: Array<(e: TraceableWalletEvent) => void> = [];

    private connector: UniversalConnector | undefined = undefined;

    private readonly config: UniversalConnectorConfig;

    constructor(
        // TODO: remove default values
        private readonly projectKey: string = '9cb446f4a1b697039a23332618d942b0',
        private readonly metadata: DappMetadata = {
            name: 'Demo DApp',
            url: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS0uc4aSvQASroq4VfMx30RkZzIX8wiefg3rQ&s',
            icon: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcS0uc4aSvQASroq4VfMx30RkZzIX8wiefg3rQ&s'
        }
    ) {
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

    private async initialize(): Promise<UniversalConnector> {
        return await UniversalConnector.init(this.config);
    }

    connect(message: ConnectRequest, options?: OptionalTraceable) {
        const traceId = options?.traceId ?? UUIDv7();
        this._connect(message, { traceId });
    }

    async _connect(message: ConnectRequest, options: Traceable) {
        message;

        // TODO fixme
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const namespaces = this.config?.networks.reduce<any>((acc, namespace) => {
            acc[namespace.namespace] = {
                ...(namespace || {}),
                methods: namespace?.methods || [],
                events: namespace?.events || [],
                chains: namespace?.chains?.map(chain => chain.caipNetworkId) || []
            };

            return acc;
        }, {});

        if (!this.connector) {
            this.connector = await this.initialize();
        }

        // TODO: this does not opens qr or return any link
        // console.log('Connecting through this.connector.provider.connect');
        // await this.connector.provider.connect({
        //     optionalNamespaces: namespaces
        // });
        // console.log('Connected through this.connector.provider.connect');
        console.log('Connecting through this.connector.connect');
        await this.connector.connect();
        console.log('Connected through this.connector.connect');

        const session = this.connector.provider.session!;
        const peer = session.peer;

        const payload: {
            items: ConnectItemReply[];
            device: DeviceInfo;
        } = {
            items: [
                {
                    name: 'ton_addr',
                    address: '0:fc0df8ec68af20331fc7e015a3c1daa540d8593506256826b87d6aa0c78f1670', // TODO
                    network: CHAIN.MAINNET, // TODO, probably should pass network on connect, would be in protocol in the near future,
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

        this.listeners.forEach(listener =>
            listener({ event: 'connect', payload, traceId: options.traceId })
        );
    }

    async restoreConnection(
        _options?: OptionalTraceable<{ openingDeadlineMS?: number; signal?: AbortSignal }>
    ): Promise<void> {
        // TODO?
        // await this._connect();
    }

    closeConnection(): void {
        void this.connector?.disconnect();
    }

    async disconnect(_options?: OptionalTraceable<{ signal?: AbortSignal }>): Promise<void> {
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
        // let request: RequestArguments; TODO: export
        if (request.method === 'sendTransaction') {
            const { network, ...sendTransactionPayload } = JSON.parse(request.params[0]!);
            // TODO: extra currencies not supported yet
            const result = await this.connector?.request(
                {
                    method: 'ton_sendMessage',
                    params: [JSON.stringify(sendTransactionPayload)]
                },
                `ton:${network}`
            );
            console.log('Send transaction result', result);
        } else if (request.method === 'signData') {
            const { network, ...signDataPayload } = JSON.parse(
                request.params[0]!
            ) as SignDataPayload;

            const result = await this.connector?.request(
                {
                    method: 'ton_signData',
                    params: [JSON.stringify(signDataPayload)]
                },
                `ton:${network}`
            );
            console.log('Sign data result', result);
        } else {
            return {
                id: '0',
                error: { code: DISCONNECT_ERROR_CODES.UNKNOWN_ERROR, message: 'Not implemented.' },
                traceId: ''
            };
        }

        // TODO: wait for response
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
}
