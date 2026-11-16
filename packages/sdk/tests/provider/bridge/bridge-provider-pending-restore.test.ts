import { afterAll, afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

const { FakeEventSource } = vi.hoisted(() => {
    class FakeEventSource {
        static readonly CONNECTING = 0;
        static readonly OPEN = 1;
        static readonly CLOSED = 2;
        static instances: FakeEventSource[] = [];

        readyState = FakeEventSource.CONNECTING;
        onopen: ((e: unknown) => void) | null = null;
        onmessage: ((e: unknown) => void) | null = null;
        onerror: ((e: unknown) => unknown) | null = null;

        constructor(public readonly url: string) {
            FakeEventSource.instances.push(this);
        }

        close(): void {
            this.readyState = FakeEventSource.CLOSED;
        }

        open(): void {
            this.readyState = FakeEventSource.OPEN;
            this.onopen?.({ type: 'open' });
        }

        emit(data: string, lastEventId: string): void {
            this.onmessage?.({ data, lastEventId });
        }

        // A browser closes the source before firing `error` when the first attempt fails.
        fail(): void {
            this.readyState = FakeEventSource.CLOSED;
            void this.onerror?.({ type: 'error' });
        }
    }

    // Installed before the gateway imports @tonconnect/isomorphic-eventsource, which only
    // polyfills a missing global.
    vi.stubGlobal('EventSource', FakeEventSource);
    return { FakeEventSource };
});

import { Base64, hexToByteArray, SessionCrypto } from '@tonconnect/protocol';
import { fetchMocker } from 'tests/setup';
import { BridgeProvider } from 'src/provider/bridge/bridge-provider';
import { BridgeConnectionStorage } from 'src/storage/bridge-connection-storage';
import { IStorage } from 'src/storage/models/storage.interface';
import { WalletsListManager } from 'src/wallets-list-manager';

const WALLETS_LIST_SOURCE = 'https://wallets.test/wallets-v2.json';
const RECONNECT_DELAY_MS = 2000;
const bridgeUrls = [1, 2, 3, 4, 5, 6].map(n => `https://bridge-${n}.test/bridge`);

const flush = (): Promise<void> => new Promise(resolve => setImmediate(resolve));

class MemoryStorage implements IStorage {
    private readonly items = new Map<string, string>();

    async setItem(key: string, value: string): Promise<void> {
        this.items.set(key, value);
    }

    async getItem(key: string): Promise<string | null> {
        return this.items.get(key) ?? null;
    }

    async removeItem(key: string): Promise<void> {
        this.items.delete(key);
    }
}

describe('BridgeProvider restoring a pending connection', () => {
    let provider: BridgeProvider | undefined;
    let sessionCrypto: SessionCrypto;
    let finished: boolean;

    const instanceOf = (bridgeUrl: string) => {
        const instance = FakeEventSource.instances.find(i => i.url.startsWith(bridgeUrl));
        if (!instance) {
            throw new Error(`No EventSource was created for ${bridgeUrl}`);
        }
        return instance;
    };

    const startRestore = async (): Promise<void> => {
        const connectionStorage = new BridgeConnectionStorage(
            new MemoryStorage(),
            new WalletsListManager({ walletsListSource: WALLETS_LIST_SOURCE })
        );
        sessionCrypto = new SessionCrypto();
        await connectionStorage.storeConnection({
            type: 'http',
            connectionSource: bridgeUrls.map(bridgeUrl => ({ bridgeUrl })),
            sessionCrypto
        });
        provider = await BridgeProvider.fromStorage(connectionStorage);

        finished = false;
        void provider.restoreConnection().then(() => {
            finished = true;
        });
        for (
            let turn = 0;
            turn < 10 && FakeEventSource.instances.length < bridgeUrls.length;
            turn++
        ) {
            await flush();
        }
        expect(FakeEventSource.instances).toHaveLength(bridgeUrls.length);
    };

    beforeEach(() => {
        fetchMocker.mockIf(WALLETS_LIST_SOURCE, () => ({ body: '[]' }));
        vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
        FakeEventSource.instances = [];
    });

    afterEach(() => {
        provider?.closeConnection();
        provider = undefined;
        vi.useRealTimers();
        fetchMocker.resetMocks();
    });

    afterAll(() => {
        vi.unstubAllGlobals();
    });

    it('waits for all but three bridges of a pending connection to open', async () => {
        await startRestore();

        instanceOf(bridgeUrls[0]!).open();
        instanceOf(bridgeUrls[1]!).open();
        await flush();
        expect(finished).toBe(false);

        instanceOf(bridgeUrls[2]!).open();
        await flush();
        expect(finished).toBe(true);
    });

    it('does not wait for bridges that fail to connect', async () => {
        await startRestore();

        bridgeUrls.slice(0, 4).forEach(url => instanceOf(url).fail());
        bridgeUrls.slice(4).forEach(url => instanceOf(url).open());
        await flush();

        expect(finished).toBe(true);
    });

    it('finishes restoring a pending connection when no bridge can be reached', async () => {
        await startRestore();

        bridgeUrls.forEach(url => instanceOf(url).fail());
        await flush();

        expect(finished).toBe(true);
    });

    it('connects a wallet that answers through a bridge that was unreachable at first', async () => {
        await startRestore();
        const events: { event: string }[] = [];
        provider!.listen(e => events.push(e));
        const walletBridge = bridgeUrls[0]!;

        bridgeUrls.forEach(url => instanceOf(url).fail());
        await flush();
        expect(finished).toBe(true);

        const firstAttempts = FakeEventSource.instances.length;
        await vi.advanceTimersByTimeAsync(RECONNECT_DELAY_MS);
        await flush();
        const retry = FakeEventSource.instances
            .slice(firstAttempts)
            .find(i => i.url.startsWith(walletBridge));
        expect(retry).toBeDefined();
        retry!.open();
        await flush();

        const walletCrypto = new SessionCrypto();
        const connectEvent = {
            event: 'connect',
            id: 1,
            payload: {
                items: [
                    {
                        name: 'ton_addr',
                        address: '0:' + '0'.repeat(64),
                        network: '-239',
                        walletStateInit: '',
                        publicKey: '0'.repeat(64)
                    }
                ],
                device: {
                    platform: 'android',
                    appName: 'wallet',
                    appVersion: '1.0.0',
                    maxProtocolVersion: 2,
                    features: []
                }
            }
        };
        const message = Base64.encode(
            walletCrypto.encrypt(
                JSON.stringify(connectEvent),
                hexToByteArray(sessionCrypto.sessionId)
            )
        );
        retry!.emit(JSON.stringify({ from: walletCrypto.sessionId, message }), '1');

        await vi.waitFor(() => expect(events.map(e => e.event)).toEqual(['connect']));
    });
});
