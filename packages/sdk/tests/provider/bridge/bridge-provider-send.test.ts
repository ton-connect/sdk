import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { Base64, CHAIN, hexToByteArray, SessionCrypto } from '@tonconnect/protocol';
import { BridgeProvider } from 'src/provider/bridge/bridge-provider';
import { BridgeGateway } from 'src/provider/bridge/bridge-gateway';
import { BridgeIncomingMessage } from 'src/provider/bridge/models/bridge-incomming-message';
import { BridgeConnectionStorage } from 'src/storage/bridge-connection-storage';

const bridgeUrl = 'https://bridge.test/bridge';
const request = { method: 'sendTransaction' as const, params: ['{}'] as [string] };
const flush = (): Promise<void> => new Promise(resolve => setImmediate(resolve));

describe('BridgeProvider.sendRequest response ordering', () => {
    let incoming: (message: BridgeIncomingMessage) => Promise<void>;
    let dapp: SessionCrypto;
    let wallet: SessionCrypto;
    let provider: BridgeProvider;

    beforeEach(async () => {
        vi.spyOn(console, 'debug').mockImplementation(() => {});
        vi.spyOn(BridgeGateway.prototype, 'registerSession').mockImplementation(async function () {
            // Capture the real provider listener while replacing only the network transport.
            incoming = this['listener'];
        });
        vi.spyOn(BridgeGateway.prototype, 'close').mockResolvedValue();
        dapp = new SessionCrypto();
        wallet = new SessionCrypto();
        const map = new Map<string, string>();
        const storage = new BridgeConnectionStorage(
            {
                setItem: async (key, value) => void map.set(key, value),
                getItem: async key => map.get(key) ?? null,
                removeItem: async key => void map.delete(key)
            },
            { getRemoteWallet: async () => ({ bridgeUrl }) } as never
        );
        await storage.storeConnection({
            type: 'http',
            session: { sessionCrypto: dapp, walletPublicKey: wallet.sessionId, bridgeUrl },
            nextRpcRequestId: 0,
            connectEvent: {
                event: 'connect',
                payload: {
                    device: {
                        platform: 'android',
                        appName: 'test-wallet',
                        appVersion: '1',
                        maxProtocolVersion: 2,
                        features: []
                    },
                    items: [
                        {
                            name: 'ton_addr',
                            address: '0:' + '0'.repeat(64),
                            network: CHAIN.MAINNET,
                            walletStateInit: '',
                            publicKey: ''
                        }
                    ]
                }
            }
        });
        provider = new BridgeProvider(storage, { bridgeUrl });
        await provider.restoreConnection();
    });

    afterEach(() => {
        provider?.closeConnection();
        vi.restoreAllMocks();
    });

    function decodeRequest(bytes: Uint8Array): { id: string } {
        return JSON.parse(wallet.decrypt(bytes, hexToByteArray(dapp.sessionId)));
    }

    function reply(id: string): Promise<void> {
        return incoming({
            from: wallet.sessionId,
            message: Base64.encode(
                wallet.encrypt(
                    JSON.stringify({ id, result: 'test-boc' }),
                    hexToByteArray(dapp.sessionId)
                )
            )
        });
    }

    it('receives an encrypted wallet reply before the bridge POST completes', async () => {
        let finishPost!: () => void;
        const post = new Promise<void>(resolve => {
            finishPost = resolve;
        });
        vi.spyOn(BridgeGateway.prototype, 'send').mockImplementation(async bytes => {
            await reply(decodeRequest(bytes).id);
            await post;
        });
        const onRequestSent = vi.fn();
        const settled = vi.fn();
        const pending = provider.sendRequest(request, { onRequestSent }).then(settled);
        await flush();
        expect(onRequestSent).not.toHaveBeenCalled();
        finishPost();
        await flush();
        expect(settled).toHaveBeenCalledWith(
            expect.objectContaining({ id: '0', result: 'test-boc' })
        );
        expect(onRequestSent).toHaveBeenCalledOnce();
        await pending;
    });

    it('receives a wallet reply delivered from onRequestSent', async () => {
        vi.spyOn(BridgeGateway.prototype, 'send').mockResolvedValue();
        const settled = vi.fn();
        const pending = provider
            .sendRequest(request, {
                onRequestSent: () => {
                    void reply('0');
                }
            })
            .then(settled);
        await flush();
        expect(settled).toHaveBeenCalledWith(
            expect.objectContaining({ id: '0', result: 'test-boc' })
        );
        await pending;
    });

    it('keeps waiting after POST completion until the wallet responds', async () => {
        vi.spyOn(BridgeGateway.prototype, 'send').mockResolvedValue();
        const settled = vi.fn();
        const pending = provider.sendRequest(request).then(settled);
        await flush();
        expect(settled).not.toHaveBeenCalled();
        await reply('0');
        await pending;
        expect(settled).toHaveBeenCalledOnce();
    });

    it.each([new Error('POST failed'), new DOMException('Aborted', 'AbortError')])(
        'rejects a failed POST and removes its response listener (%s)',
        async error => {
            vi.spyOn(BridgeGateway.prototype, 'send').mockRejectedValue(error);
            await expect(provider.sendRequest(request)).rejects.toBe(error);
            await reply('0');
            expect(console.debug).toHaveBeenCalledWith(
                expect.anything(),
                "Response id 0 doesn't match any request's id"
            );
        }
    );

    it('rejects a throwing onRequestSent callback and removes its response listener', async () => {
        vi.spyOn(BridgeGateway.prototype, 'send').mockResolvedValue();
        const error = new Error('callback failed');
        await expect(
            provider.sendRequest(request, {
                onRequestSent: () => {
                    throw error;
                }
            })
        ).rejects.toBe(error);
        await reply('0');
        expect(console.debug).toHaveBeenCalledWith(
            expect.anything(),
            "Response id 0 doesn't match any request's id"
        );
    });

    it('rejects a send without an established session', async () => {
        provider.closeConnection();
        await expect(provider.sendRequest(request)).rejects.toThrow(
            'Trying to send bridge request without session'
        );
    });

    it('ignores a response for a different request and settles once for the matching id', async () => {
        vi.spyOn(BridgeGateway.prototype, 'send').mockResolvedValue();
        const settled = vi.fn();
        const pending = provider.sendRequest(request).then(settled);
        await flush();
        await reply('42');
        expect(settled).not.toHaveBeenCalled();
        await reply('0');
        await pending;
        await reply('0');
        expect(settled).toHaveBeenCalledOnce();
    });
});
