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

        private closedBySdk = false;

        close(): void {
            this.readyState = FakeEventSource.CLOSED;
            this.closedBySdk = true;
        }

        open(): void {
            this.assertNotClosedBySdk();
            this.readyState = FakeEventSource.OPEN;
            this.onopen?.({ type: 'open' });
        }

        emit(data: string, lastEventId: string): void {
            this.assertNotClosedBySdk();
            this.onmessage?.({ data, lastEventId });
        }

        // A browser closes the source before firing `error` when the first attempt fails.
        fail(): void {
            this.assertNotClosedBySdk();
            this.readyState = FakeEventSource.CLOSED;
            void this.onerror?.({ type: 'error' });
        }

        // A closed source fires nothing, so a test driving one would pass without the SDK
        // having made the attempt it is about.
        private assertNotClosedBySdk(): void {
            if (this.closedBySdk) {
                throw new Error(`The SDK has closed the stream to ${this.url}`);
            }
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

    const attemptsOf = (bridgeUrl: string) =>
        FakeEventSource.instances.filter(i => i.url.startsWith(bridgeUrl));

    const retryOf = (bridgeUrl: string) => {
        const attempts = attemptsOf(bridgeUrl);
        if (attempts.length < 2) {
            throw new Error(`No connection to ${bridgeUrl} was retried`);
        }
        return attempts[attempts.length - 1]!;
    };

    const waitForReconnect = async (): Promise<void> => {
        await vi.advanceTimersByTimeAsync(RECONNECT_DELAY_MS);
        await flush();
    };

    const walletMessage = (walletCrypto: SessionCrypto, sessionId: string, payload: object) =>
        JSON.stringify({
            from: walletCrypto.sessionId,
            message: Base64.encode(
                walletCrypto.encrypt(JSON.stringify(payload), hexToByteArray(sessionId))
            )
        });

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

    describe('when the wallet answers through a bridge that was unreachable at first', () => {
        let events: { event: string }[];
        let walletStream: InstanceType<typeof FakeEventSource>;

        beforeEach(async () => {
            await startRestore();
            events = [];
            provider!.listen(e => events.push(e));

            bridgeUrls.forEach(url => instanceOf(url).fail());
            await flush();
            expect(finished).toBe(true);
            await waitForReconnect();

            walletStream = retryOf(bridgeUrls[0]!);
            walletStream.open();
            walletStream.emit(
                walletMessage(new SessionCrypto(), sessionCrypto.sessionId, connectEvent),
                '1'
            );
        });

        it('connects the wallet', async () => {
            await vi.waitFor(() => expect(events.map(e => e.event)).toEqual(['connect']));
        });

        it('keeps the stream of that bridge open', async () => {
            await vi.waitFor(() => expect(events.map(e => e.event)).toEqual(['connect']));
            await waitForReconnect();
            await waitForReconnect();

            expect(attemptsOf(bridgeUrls[0]!)).toHaveLength(2);
            expect(walletStream.readyState).toBe(FakeEventSource.OPEN);
        });
    });

    it('opens no stream once the connection is closed while it was being resumed', async () => {
        await startRestore();
        bridgeUrls.slice(0, 3).forEach(url => instanceOf(url).open());
        await flush();
        expect(finished).toBe(true);

        provider!.pause();
        provider!.unPause().catch(() => {});
        provider!.closeConnection();
        const created = FakeEventSource.instances.length;
        await waitForReconnect();

        expect(FakeEventSource.instances).toHaveLength(created);
        expect(
            FakeEventSource.instances.filter(i => i.readyState !== FakeEventSource.CLOSED)
        ).toHaveLength(0);
    });
});
