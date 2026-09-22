import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import { WalletTransportError } from 'src/errors';
import { isNormalized } from 'src/errors/wallet-response/marks';
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
        const wallet = fakeWallet({ send: vi.fn(() => Promise.reject(new Error('300'))) });
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
        const provider = await providerWith(
            fakeWallet({ send: vi.fn(() => Promise.reject(reason)) })
        );

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
        ['a string', 'ok']
    ])('turns a wallet response of %s into WalletTransportError', async (_name, value) => {
        const provider = await providerWith(fakeWallet({ send: vi.fn(() => value) }));

        const error = await provider.sendRequest(request).catch(e => e);

        expect(error).toBeInstanceOf(WalletTransportError);
        expect(error.cause).toBe(value);
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
