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

        // A browser puts a stream that drops after opening back into CONNECTING before firing `error`.
        drop(): void {
            this.readyState = FakeEventSource.CONNECTING;
            void this.onerror?.({ type: 'error' });
        }
    }

    // Installed before the gateway imports @tonconnect/isomorphic-eventsource, which only
    // polyfills a missing global.
    vi.stubGlobal('EventSource', FakeEventSource);
    return { FakeEventSource };
});

import { BridgeGateway } from 'src/provider/bridge/bridge-gateway';

const BRIDGE_URL = 'https://bridge.test/bridge';
const LAST_EVENT_ID_KEY = `ton-connect-storage_http-bridge-gateway::${BRIDGE_URL}`;
const RECONNECT_DELAY_MS = 2000;
const payload = JSON.stringify({ message: 'bWVzc2FnZQ==', from: 'sender' });

const flush = (): Promise<void> => new Promise(resolve => setImmediate(resolve));

function memoryStorage() {
    const map = new Map<string, string>();
    return {
        map,
        setItem: async (key: string, value: string) => void map.set(key, value),
        getItem: async (key: string) => map.get(key) ?? null,
        removeItem: async (key: string) => void map.delete(key)
    };
}

describe('BridgeGateway', () => {
    let gateway: BridgeGateway | undefined;

    beforeEach(() => {
        vi.useFakeTimers({ toFake: ['setTimeout', 'clearTimeout'] });
        FakeEventSource.instances = [];
    });

    afterEach(async () => {
        await gateway?.close();
        gateway = undefined;
        vi.useRealTimers();
    });

    afterAll(() => {
        vi.unstubAllGlobals();
    });

    it('reconnects a dropped stream from the last stored event id', async () => {
        const storage = memoryStorage();
        const listener = vi.fn();
        gateway = new BridgeGateway(storage, BRIDGE_URL, 'client', listener, vi.fn());

        const registered = gateway.registerSession();
        await flush();
        const [first] = FakeEventSource.instances;
        first!.open();
        await registered;
        first!.emit(payload, '42');
        await flush();

        first!.drop();
        await flush();
        expect(first!.readyState).toBe(FakeEventSource.CLOSED);

        await vi.advanceTimersByTimeAsync(RECONNECT_DELAY_MS);
        await flush();
        expect(FakeEventSource.instances).toHaveLength(2);
        const second = FakeEventSource.instances[1]!;
        const url = new URL(second.url);
        expect(url.searchParams.get('client_id')).toBe('client');
        expect(url.searchParams.get('last_event_id')).toBe('42');

        second.open();
        await flush();
        second.emit(payload, '43');
        await flush();
        expect(listener).toHaveBeenCalledTimes(2);

        await vi.advanceTimersByTimeAsync(5 * RECONNECT_DELAY_MS);
        expect(FakeEventSource.instances).toHaveLength(2);
    });

    it('closes an attempt that opens after its opening deadline', async () => {
        const storage = memoryStorage();
        const listener = vi.fn();
        gateway = new BridgeGateway(storage, BRIDGE_URL, 'client', listener, vi.fn());

        const outcome = gateway.registerSession({ openingDeadlineMS: 1000 }).then(
            () => 'resolved',
            () => 'rejected'
        );
        await flush();
        const [attempt] = FakeEventSource.instances;

        await vi.advanceTimersByTimeAsync(1000);
        expect(await outcome).toBe('rejected');

        attempt!.open();
        attempt!.emit(payload, '7');
        await flush();
        expect(attempt!.readyState).toBe(FakeEventSource.CLOSED);
        expect(storage.map.has(LAST_EVENT_ID_KEY)).toBe(false);
        expect(listener).not.toHaveBeenCalled();
    });

    it('retries a reconnect attempt that misses its opening deadline', async () => {
        const storage = memoryStorage();
        const listener = vi.fn();
        gateway = new BridgeGateway(storage, BRIDGE_URL, 'client', listener, vi.fn());

        const registered = gateway.registerSession({ openingDeadlineMS: 1000 });
        await flush();
        const [first] = FakeEventSource.instances;
        first!.open();
        await registered;
        first!.emit(payload, '42');
        await flush();

        first!.drop();
        await vi.advanceTimersByTimeAsync(RECONNECT_DELAY_MS);
        await flush();
        const timedOut = FakeEventSource.instances[1]!;
        await vi.advanceTimersByTimeAsync(1000);
        await flush();
        expect(timedOut.readyState).toBe(FakeEventSource.CLOSED);

        await vi.advanceTimersByTimeAsync(RECONNECT_DELAY_MS);
        await flush();
        expect(FakeEventSource.instances).toHaveLength(3);
        const third = FakeEventSource.instances[2]!;
        expect(new URL(third.url).searchParams.get('last_event_id')).toBe('42');

        third.open();
        await flush();
        third.emit(payload, '43');
        await flush();
        expect(listener).toHaveBeenCalledTimes(2);
    });

    it('does not retry a reconnect attempt cancelled by a pause', async () => {
        gateway = new BridgeGateway(memoryStorage(), BRIDGE_URL, 'client', vi.fn(), vi.fn());

        const registered = gateway.registerSession({ openingDeadlineMS: 1000 });
        await flush();
        FakeEventSource.instances[0]!.open();
        await registered;

        FakeEventSource.instances[0]!.drop();
        await vi.advanceTimersByTimeAsync(RECONNECT_DELAY_MS);
        await flush();
        expect(FakeEventSource.instances).toHaveLength(2);

        gateway.pause();
        await vi.advanceTimersByTimeAsync(5 * RECONNECT_DELAY_MS);
        await flush();
        expect(FakeEventSource.instances).toHaveLength(2);
    });

    it('retries a first attempt that fails before opening', async () => {
        gateway = new BridgeGateway(memoryStorage(), BRIDGE_URL, 'client', vi.fn(), vi.fn());

        const outcome = gateway.registerSession().then(
            () => 'resolved',
            () => 'rejected'
        );
        await flush();
        FakeEventSource.instances[0]!.drop();
        await flush();

        await vi.advanceTimersByTimeAsync(RECONNECT_DELAY_MS);
        await flush();
        expect(FakeEventSource.instances).toHaveLength(2);
        expect(await outcome).toBe('rejected');
    });

    it('does not reconnect while paused and resumes from the last stored event id', async () => {
        const storage = memoryStorage();
        gateway = new BridgeGateway(storage, BRIDGE_URL, 'client', vi.fn(), vi.fn());

        const registered = gateway.registerSession();
        await flush();
        const [first] = FakeEventSource.instances;
        first!.open();
        await registered;
        first!.emit(payload, '42');
        await flush();

        first!.drop();
        await flush();
        gateway.pause();
        await vi.advanceTimersByTimeAsync(RECONNECT_DELAY_MS);
        await flush();
        expect(FakeEventSource.instances).toHaveLength(1);

        const resumed = gateway.unPause();
        await vi.advanceTimersByTimeAsync(0);
        await flush();
        expect(FakeEventSource.instances).toHaveLength(2);
        const second = FakeEventSource.instances[1]!;
        expect(new URL(second.url).searchParams.get('last_event_id')).toBe('42');
        second.open();
        await resumed;
    });
});
