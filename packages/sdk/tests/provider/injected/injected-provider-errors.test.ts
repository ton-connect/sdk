import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { TonConnectError, WalletTransportError } from 'src/errors';
import { attachedErrorOf, isNormalized } from 'src/errors/wallet-response/marks';
import { InjectedProvider } from 'src/provider/injected/injected-provider';
import { BridgeConnectionStorage } from 'src/storage/bridge-connection-storage';
import { IStorage } from 'src/storage/models/storage.interface';

const KEY = 'testwallet';

function memoryStorage(): IStorage {
    const map = new Map<string, string>();
    return {
        setItem: async (k, v) => void map.set(k, v),
        getItem: async k => map.get(k) ?? null,
        removeItem: async k => void map.delete(k)
    };
}

// Wallet methods that reject are plain functions, not vi.fn: a spy attaches its own
// handler to every promise it returns, which would hide an unhandled rejection.
function fakeWallet(overrides: Record<string, unknown> = {}) {
    return {
        deviceInfo: {
            platform: 'iphone',
            appName: KEY,
            appVersion: '1.0.0',
            maxProtocolVersion: 2,
            features: []
        },
        walletInfo: { name: 'Test', app_name: KEY, image: '', about_url: '', platforms: [] },
        protocolVersion: 2,
        isWalletBrowser: true,
        connect: vi.fn(),
        restoreConnection: vi.fn(),
        send: vi.fn(),
        listen: vi.fn(() => () => {}),
        disconnect: vi.fn(),
        ...overrides
    };
}

function fakeAnalytics() {
    const analytics = {
        emitJsBridgeCall: vi.fn(),
        emitJsBridgeResponse: vi.fn(),
        emitJsBridgeError: vi.fn()
    };
    return { analytics, manager: { scoped: () => analytics } };
}

async function providerWith(
    wallet: Record<string, unknown>,
    options: { storage?: IStorage; analyticsManager?: unknown } = {}
): Promise<InjectedProvider> {
    (InjectedProvider as unknown as { window: unknown }).window = {
        [KEY]: { tonconnect: wallet }
    };
    const connectionStorage = new BridgeConnectionStorage(
        options.storage ?? memoryStorage(),
        undefined as never
    );
    await connectionStorage.storeConnection({
        type: 'injected',
        jsBridgeKey: KEY,
        nextRpcRequestId: 0
    });
    return new InjectedProvider(connectionStorage, KEY, options.analyticsManager as never);
}

const request = { method: 'sendTransaction' as const, params: ['{}'] as [string] };

let debug: ReturnType<typeof vi.spyOn>;

function debugLabels(): unknown[] {
    return debug.mock.calls.map(call => call[1]);
}

beforeEach(() => {
    debug = vi.spyOn(console, 'debug').mockImplementation(() => {});
});

afterEach(() => {
    debug.mockRestore();
});

describe('InjectedProvider.sendRequest', () => {
    it('resolves a legacy numeric rejection as a marked error response with the request id', async () => {
        const { analytics, manager } = fakeAnalytics();
        const wallet = fakeWallet({ send: () => Promise.reject(new Error('300')) });
        const provider = await providerWith(wallet, { analyticsManager: manager });

        const response = (await provider.sendRequest(request)) as { id: string; error: object };

        expect(response).toEqual({ id: '0', error: { code: 300, message: '300' } });
        expect(isNormalized(response.error)).toBe(true);
        expect(debugLabels()).toContain('Wallet request rejected, normalized:');
        expect(debugLabels()).not.toContain('Wallet message received:');
        expect(analytics.emitJsBridgeError).toHaveBeenCalledTimes(1);
        expect(analytics.emitJsBridgeResponse).not.toHaveBeenCalled();
    });

    it('rejects a non-TON-Connect rejection as WalletTransportError keeping the cause', async () => {
        const reason = new Error('Отменено пользователем');
        const provider = await providerWith(fakeWallet({ send: () => Promise.reject(reason) }));

        const error = await provider.sendRequest(request).catch(e => e);

        expect(error).toBeInstanceOf(WalletTransportError);
        expect(error.cause).toBe(reason);
    });

    it.each([
        [
            'send throws synchronously',
            fakeWallet({
                send: vi.fn(() => {
                    throw new TypeError('boom');
                })
            })
        ],
        ['send is missing', fakeWallet({ send: undefined })]
    ])(
        'turns "%s" into WalletTransportError without calling onRequestSent',
        async (_name, wallet) => {
            const provider = await providerWith(wallet);
            const onRequestSent = vi.fn();

            const error = await provider.sendRequest(request, { onRequestSent }).catch(e => e);

            expect(error).toBeInstanceOf(WalletTransportError);
            expect(onRequestSent).not.toHaveBeenCalled();
        }
    );

    it.each([
        ['undefined', undefined],
        ['null', null],
        ['a string', 'ok'],
        ['an empty object', {}],
        ['an object with only an id', { id: '0' }],
        ['a null error', { id: '0', error: null }],
        ['a text error', { id: '0', error: 'Declined' }],
        ['an error without a code', { id: '0', error: { message: 'Declined' } }],
        ['an error with a non-numeric code', { id: '0', error: { code: 'x' } }],
        ['an error with the code in a string', { id: '0', error: { code: '300' } }],
        ['an error with a fractional code', { id: '0', error: { code: 300.5 } }]
    ])('turns a wallet response of %s into WalletTransportError', async (_name, value) => {
        const provider = await providerWith(fakeWallet({ send: vi.fn(() => value) }));

        const error = await provider.sendRequest(request).catch(e => e);

        expect(error).toBeInstanceOf(WalletTransportError);
        expect(error.cause).toBe(value);
    });

    it.each([
        ['a result', { id: '0', result: 'boc' }],
        ['an error', { id: '0', error: { code: 300, message: 'Declined' } }]
    ])('passes a wallet response carrying %s through', async (_name, response) => {
        const provider = await providerWith(fakeWallet({ send: vi.fn(() => response) }));

        await expect(provider.sendRequest(request)).resolves.toEqual(response);
    });

    it('turns a failing request id store into WalletTransportError', async () => {
        const storage = memoryStorage();
        const send = vi.fn(() => Promise.resolve({ id: '0', result: 'boc' }));
        const provider = await providerWith(fakeWallet({ send }), { storage });
        storage.setItem = async () => {
            throw new Error('quota');
        };

        await expect(provider.sendRequest(request)).rejects.toBeInstanceOf(WalletTransportError);
        expect(send).not.toHaveBeenCalled();
    });

    it('passes an onRequestSent failure through unchanged and calls it once', async () => {
        const provider = await providerWith(
            fakeWallet({ send: vi.fn(() => Promise.resolve({ id: '0', result: 'boc' })) })
        );
        const own = new Error('dapp callback');
        const onRequestSent = vi.fn(() => {
            throw own;
        });

        await expect(provider.sendRequest(request, { onRequestSent })).rejects.toBe(own);
        expect(onRequestSent).toHaveBeenCalledTimes(1);
    });

    it('keeps a real wallet error response and its log label', async () => {
        const { analytics, manager } = fakeAnalytics();
        const provider = await providerWith(
            fakeWallet({
                send: vi.fn(() => Promise.resolve({ id: '0', error: { code: 300, message: 'no' } }))
            }),
            { analyticsManager: manager }
        );

        const response = (await provider.sendRequest(request)) as { error: object };

        expect(response).toEqual({ id: '0', error: { code: 300, message: 'no' } });
        expect(isNormalized(response.error)).toBe(false);
        expect(debugLabels()).toContain('Wallet message received:');
        expect(analytics.emitJsBridgeResponse).toHaveBeenCalledTimes(1);
        expect(analytics.emitJsBridgeError).not.toHaveBeenCalled();
    });
});

type CapturedEvent = { event: string; payload?: { code: number; message: string } };

function captureEvents(provider: InjectedProvider): CapturedEvent[] {
    const events: CapturedEvent[] = [];
    provider.listen(e => events.push(e as unknown as CapturedEvent));
    return events;
}

async function settle(): Promise<void> {
    await new Promise(resolve => setTimeout(resolve, 0));
}

const connectRequest = {
    manifestUrl: 'https://example.com/m.json',
    items: [{ name: 'ton_addr' as const }]
};

function connectEventFor(wallet: ReturnType<typeof fakeWallet>) {
    return { event: 'connect', id: 1, payload: { items: [], device: wallet.deviceInfo } };
}

function connectErrorOf(events: CapturedEvent[]): { code: number; message: string } {
    const errors = events.filter(e => e.event === 'connect_error');
    expect(errors).toHaveLength(1);
    return errors[0]!.payload!;
}

describe('InjectedProvider.connect', () => {
    it('normalizes a legacy numeric rejection into connect_error with the code', async () => {
        const provider = await providerWith(
            fakeWallet({ connect: () => Promise.reject(new Error('300')) })
        );
        const events = captureEvents(provider);

        provider.connect(connectRequest);
        await settle();

        const payload = connectErrorOf(events);
        expect(payload).toEqual({ code: 300, message: '300' });
        expect(isNormalized(payload)).toBe(true);
    });

    it('attaches WalletTransportError for a non-TON-Connect rejection', async () => {
        const reason = new TypeError('bridge crashed');
        const provider = await providerWith(fakeWallet({ connect: () => Promise.reject(reason) }));
        const events = captureEvents(provider);

        provider.connect(connectRequest);
        await settle();

        const payload = connectErrorOf(events);
        expect(payload.code).toBe(0);
        const attached = attachedErrorOf(payload);
        expect(attached).toBeInstanceOf(WalletTransportError);
        expect(attached!.cause).toBe(reason);
    });

    it('does not read a failure after a successful connect as a wallet code', async () => {
        const storage = memoryStorage();
        const wallet = fakeWallet();
        wallet.connect = vi.fn(() => Promise.resolve(connectEventFor(wallet)));
        const provider = await providerWith(wallet, { storage });
        storage.setItem = async () => {
            throw new Error('300');
        };
        const events = captureEvents(provider);

        provider.connect(connectRequest);
        await settle();

        const payload = connectErrorOf(events);
        expect(isNormalized(payload)).toBe(false);
        const attached = attachedErrorOf(payload)!;
        expect(attached.constructor).toBe(TonConnectError);
        expect(attached.walletError).toBeUndefined();
    });

    it.each([
        ['undefined', undefined],
        ['null', null],
        ['a string', 'ok'],
        ['an empty object', {}],
        ['an unknown event', { event: 'transaction', id: 1, payload: {} }],
        ['a connect event without a payload', { event: 'connect', id: 1 }],
        ['a connect event without items', { event: 'connect', id: 1, payload: { device: {} } }],
        ['a connect event without a device', { event: 'connect', id: 1, payload: { items: [] } }],
        ['a connect_error event without a payload', { event: 'connect_error', id: 1 }],
        [
            'a connect_error event without a code',
            { event: 'connect_error', id: 1, payload: { message: 'No' } }
        ]
    ])('attaches WalletTransportError when connect resolves %s', async (_name, value) => {
        const provider = await providerWith(fakeWallet({ connect: () => Promise.resolve(value) }));
        const events = captureEvents(provider);

        provider.connect(connectRequest);
        await settle();

        const attached = attachedErrorOf(connectErrorOf(events));
        expect(attached).toBeInstanceOf(WalletTransportError);
        expect(attached!.cause).toBe(value);
    });

    it('passes a connect_error event from the wallet through as is', async () => {
        const answer = {
            event: 'connect_error',
            id: 1,
            payload: { code: 300, message: 'Declined' }
        };
        const provider = await providerWith(fakeWallet({ connect: () => Promise.resolve(answer) }));
        const events = captureEvents(provider);

        provider.connect(connectRequest);
        await settle();

        const payload = connectErrorOf(events);
        expect(payload).toEqual(answer.payload);
        expect(attachedErrorOf(payload)).toBeUndefined();
    });

    it('emits the wallet connect event once when everything succeeds', async () => {
        const wallet = fakeWallet();
        wallet.connect = vi.fn(() => Promise.resolve(connectEventFor(wallet)));
        const provider = await providerWith(wallet);
        const events = captureEvents(provider);

        provider.connect(connectRequest);
        await settle();

        expect(events.map(e => e.event)).toEqual(['connect']);
    });
});

describe('InjectedProvider.restoreConnection', () => {
    it('does not subscribe to a wallet that restores with a malformed connect event', async () => {
        const storage = memoryStorage();
        const wallet = fakeWallet({
            restoreConnection: () => Promise.resolve({ event: 'connect', id: 1 })
        });
        const provider = await providerWith(wallet, { storage });
        vi.spyOn(console, 'error').mockImplementation(() => {});

        await provider.restoreConnection();

        expect(wallet.listen).not.toHaveBeenCalled();
    });
});

describe('InjectedProvider.disconnect', () => {
    it.each([
        ['wallet disconnect works', fakeWallet()],
        [
            'wallet disconnect throws and send is missing',
            fakeWallet({
                disconnect: vi.fn(() => {
                    throw new Error('x');
                }),
                send: undefined
            })
        ],
        [
            'wallet disconnect throws and send rejects',
            fakeWallet({
                disconnect: vi.fn(() => {
                    throw new Error('x');
                }),
                send: () => Promise.reject(new Error('y'))
            })
        ],
        [
            'wallet disconnect throws and send never settles',
            fakeWallet({
                disconnect: vi.fn(() => {
                    throw new Error('x');
                }),
                send: vi.fn(() => new Promise(() => {}))
            })
        ]
    ])('settles and clears the connection when %s', async (_name, wallet) => {
        const storage = memoryStorage();
        const provider = await providerWith(wallet, { storage });

        await expect(provider.disconnect()).resolves.toBeUndefined();
        expect(await storage.getItem('ton-connect-storage_bridge-connection')).toBeNull();
    });

    it('rejects instead of hanging when connection cleanup fails', async () => {
        const storage = memoryStorage();
        const provider = await providerWith(fakeWallet(), { storage });
        storage.removeItem = async () => {
            throw new Error('storage down');
        };

        await expect(provider.disconnect()).rejects.toThrow('storage down');
    });

    it('settles when the wallet unsubscribe throws', async () => {
        const wallet = fakeWallet({
            listen: vi.fn(() => () => {
                throw new Error('unsubscribe');
            })
        });
        wallet.connect = vi.fn(() => Promise.resolve(connectEventFor(wallet)));
        const provider = await providerWith(wallet);
        provider.connect(connectRequest);
        await settle();

        await expect(provider.disconnect()).resolves.toBeUndefined();
    });
});

async function unhandledRejectionsDuring(action: () => Promise<void>): Promise<unknown[]> {
    const reasons: unknown[] = [];
    const record = (reason: unknown): void => void reasons.push(reason);
    process.on('unhandledRejection', record);
    try {
        await action();
        await settle();
        await settle();
    } finally {
        process.off('unhandledRejection', record);
    }
    return reasons;
}

describe('InjectedProvider wallet-initiated disconnect', () => {
    it('does not leave an unhandled rejection when connection cleanup fails', async () => {
        const storage = memoryStorage();
        let emit: (e: unknown) => void = () => {};
        const wallet = fakeWallet({
            listen: vi.fn((callback: (e: unknown) => void) => {
                emit = callback;
                return () => {};
            })
        });
        wallet.connect = vi.fn(() => Promise.resolve(connectEventFor(wallet)));
        const provider = await providerWith(wallet, { storage });
        provider.connect(connectRequest);
        await settle();
        storage.removeItem = async () => {
            throw new Error('storage down');
        };

        const reasons = await unhandledRejectionsDuring(async () => {
            emit({ event: 'disconnect', id: 2, payload: {} });
        });

        expect(reasons).toEqual([]);
    });
});

describe('InjectedProvider wallet-initiated events', () => {
    async function connectedWithEmitter() {
        let emit: (e: unknown) => void = () => {};
        const wallet = fakeWallet({
            listen: vi.fn((callback: (e: unknown) => void) => {
                emit = callback;
                return () => {};
            })
        });
        wallet.connect = vi.fn(() => Promise.resolve(connectEventFor(wallet)));
        const provider = await providerWith(wallet);
        provider.connect(connectRequest);
        await settle();
        const events = captureEvents(provider);
        return { emit, events };
    }

    it.each([
        ['a connect event without a payload', { event: 'connect', id: 3 }],
        ['a connect_error event without a code', { event: 'connect_error', id: 3, payload: {} }]
    ])('reports %s as WalletTransportError', async (_name, event) => {
        const { emit, events } = await connectedWithEmitter();

        emit(event);

        const attached = attachedErrorOf(connectErrorOf(events));
        expect(attached).toBeInstanceOf(WalletTransportError);
        expect(attached!.cause).toBe(event);
    });

    it.each([
        [
            'a connect_error event',
            { event: 'connect_error', id: 3, payload: { code: 300, message: 'No' } }
        ],
        ['a disconnect event', { event: 'disconnect', id: 3, payload: {} }],
        ['an event this SDK does not know', { event: 'transaction', id: 3, payload: {} }]
    ])('forwards %s as is', async (_name, event) => {
        const { emit, events } = await connectedWithEmitter();

        emit(event);

        expect(events).toHaveLength(1);
        expect(events[0]).toMatchObject(event);
        expect(attachedErrorOf(events[0]!.payload ?? {})).toBeUndefined();
    });

    it.each([
        ['null', null],
        ['a string', 'connect']
    ])('ignores %s without throwing into the wallet', async (_name, value) => {
        const { emit, events } = await connectedWithEmitter();

        expect(() => emit(value)).not.toThrow();
        expect(events).toHaveLength(0);
    });
});

describe('InjectedProvider.sendRequest when the dApp onRequestSent throws', () => {
    // A plain function, not vi.fn: a spy attaches its own handler to the promise it
    // returns, which would hide an unhandled rejection.
    it('still handles the wallet rejection that arrives afterwards', async () => {
        const { analytics, manager } = fakeAnalytics();
        let rejectSend: (reason: unknown) => void = () => {};
        const send = (): Promise<never> =>
            new Promise((_resolve, reject) => {
                rejectSend = reject;
            });
        const provider = await providerWith(fakeWallet({ send }), { analyticsManager: manager });
        const own = new Error('dapp callback');

        const reasons = await unhandledRejectionsDuring(async () => {
            const error = await provider
                .sendRequest(request, {
                    onRequestSent: () => {
                        throw own;
                    }
                })
                .catch(e => e);
            expect(error).toBe(own);
            rejectSend(new Error('300'));
        });

        expect(reasons).toEqual([]);
        expect(analytics.emitJsBridgeError).toHaveBeenCalledTimes(1);
    });
});
