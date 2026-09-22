import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

import {
    MethodNotSupportedError,
    TonConnectError,
    UserRejectsError,
    WalletTransportError
} from 'src/errors';
import { InjectedProvider } from 'src/provider/injected/injected-provider';
import { TonConnect } from 'src/ton-connect';
import { toUserFriendlyAddress } from 'src/utils/address';

const KEY = 'testwallet';
const ADDRESS = '0:' + '3'.repeat(64);

type TrackedEvent = { type: string; error_code?: number | null };

// Wallet methods that reject are plain functions, not vi.fn: a spy attaches its own
// handler to every promise it returns, which would hide an unhandled rejection.
function setup(
    send: (...args: unknown[]) => unknown,
    extra: { walletsRequiredFeatures?: unknown; removeItem?: () => Promise<void> } = {}
) {
    const device = {
        platform: 'iphone',
        appName: KEY,
        appVersion: '1.0.0',
        maxProtocolVersion: 2,
        features: [
            { name: 'SendTransaction', maxMessages: 4 },
            { name: 'SignData', types: ['text'] },
            { name: 'SignMessage', maxMessages: 4 }
        ]
    };
    const wallet = {
        deviceInfo: device,
        walletInfo: { name: 'Test', app_name: KEY, image: '', about_url: '', platforms: [] },
        protocolVersion: 2,
        isWalletBrowser: true,
        connect: vi.fn(async () => ({
            event: 'connect',
            id: 1,
            payload: {
                device,
                items: [
                    {
                        name: 'ton_addr',
                        address: ADDRESS,
                        network: '-239',
                        walletStateInit: '',
                        publicKey: ''
                    }
                ]
            }
        })),
        restoreConnection: vi.fn(),
        send,
        listen: vi.fn(() => () => {}),
        disconnect: vi.fn()
    };
    (InjectedProvider as unknown as { window: unknown }).window = { [KEY]: { tonconnect: wallet } };

    const events: TrackedEvent[] = [];
    const map = new Map<string, string>();
    const connector = new TonConnect({
        manifestUrl: 'https://example.com/tonconnect-manifest.json',
        storage: {
            setItem: async (k: string, v: string) => void map.set(k, v),
            getItem: async (k: string) => map.get(k) ?? null,
            removeItem: extra.removeItem ?? (async (k: string) => void map.delete(k))
        },
        analytics: { mode: 'off' },
        disableAutoPauseConnection: true,
        walletsRequiredFeatures: extra.walletsRequiredFeatures as never,
        eventDispatcher: {
            dispatchEvent: async (_name: string, detail: TrackedEvent) => void events.push(detail),
            addEventListener: async () => () => {}
        } as never
    });
    return { connector, wallet, events };
}

async function connected(send: (...args: unknown[]) => unknown) {
    const ctx = setup(send);
    const status = new Promise(resolve => ctx.connector.onStatusChange(resolve));
    ctx.connector.connect({ jsBridgeKey: KEY });
    await status;
    return ctx;
}

function failures(events: TrackedEvent[], type: string): TrackedEvent[] {
    return events.filter(e => e.type === type);
}

const tx = {
    validUntil: Math.floor(Date.now() / 1000) + 120,
    messages: [{ address: toUserFriendlyAddress(ADDRESS), amount: '1' }]
};

beforeEach(() => {
    vi.spyOn(console, 'debug').mockImplementation(() => {});
});

afterEach(() => {
    vi.restoreAllMocks();
});

describe('TonConnect with an injected wallet that rejects', () => {
    it('sendTransaction: Error("300") becomes UserRejectsError with walletError, tracked once', async () => {
        const { connector, events } = await connected(() => Promise.reject(new Error('300')));

        const error = await connector.sendTransaction(tx).catch(e => e);

        expect(error).toBeInstanceOf(UserRejectsError);
        expect(error.name).toBe('UserRejectsError');
        expect(
            String(error).startsWith('UserRejectsError: [TON_CONNECT_SDK_ERROR] UserRejectsError')
        ).toBe(true);
        expect(error.walletError).toEqual({
            code: 300,
            message: '300',
            responseId: '0',
            normalized: true
        });
        const tracked = failures(events, 'transaction-signing-failed');
        expect(tracked).toHaveLength(1);
        expect(tracked[0]!.error_code).toBe(300);
    });

    it('sendTransaction: a text rejection becomes WalletTransportError, tracked once', async () => {
        const reason = new Error('Canceled by the user');
        const { connector, events } = await connected(() => Promise.reject(reason));

        const error = await connector.sendTransaction(tx).catch(e => e);

        expect(error).toBeInstanceOf(WalletTransportError);
        expect(error.cause).toBe(reason);
        const tracked = failures(events, 'transaction-signing-failed');
        expect(tracked).toHaveLength(1);
        expect(tracked[0]!.error_code).toBe(0);
    });

    it('sendTransaction: a malformed wallet error becomes WalletTransportError, tracked once', async () => {
        const { connector, events } = await connected(() =>
            Promise.resolve({ id: '0', error: null })
        );

        const error = await connector.sendTransaction(tx).catch(e => e);

        expect(error).toBeInstanceOf(WalletTransportError);
        const tracked = failures(events, 'transaction-signing-failed');
        expect(tracked).toHaveLength(1);
        expect(tracked[0]!.error_code).toBe(0);
    });

    it('sendTransaction: a wallet code sent as a string is not read as that code', async () => {
        const { connector } = await connected(() =>
            Promise.resolve({ id: '0', error: { code: '300', message: 'No' } })
        );

        const error = await connector.sendTransaction(tx).catch(e => e);

        expect(error).toBeInstanceOf(WalletTransportError);
    });

    it('sendTransaction: a TonConnectError from the dApp onRequestSent is not tracked', async () => {
        const { connector, events } = await connected(() =>
            Promise.resolve({ id: '0', result: 'boc' })
        );
        const own = new TonConnectError('dapp');

        const error = await connector
            .sendTransaction(tx, {
                onRequestSent: () => {
                    throw own;
                }
            })
            .catch(e => e);

        expect(error).toBe(own);
        expect(failures(events, 'transaction-signing-failed')).toHaveLength(0);
    });

    it('sendTransaction: a WalletTransportError thrown by the dApp onRequestSent is not tracked', async () => {
        const { connector, events } = await connected(() =>
            Promise.resolve({ id: '0', result: 'boc' })
        );
        const own = new WalletTransportError('rethrown by the dApp');

        const error = await connector
            .sendTransaction(tx, {
                onRequestSent: () => {
                    throw own;
                }
            })
            .catch(e => e);

        expect(error).toBe(own);
        expect(failures(events, 'transaction-signing-failed')).toHaveLength(0);
    });

    it('signData: 400 with data keeps the wallet error and is tracked once', async () => {
        const { connector, events } = await connected(() =>
            Promise.resolve({ id: '0', error: { code: 400, message: 'nope', data: { m: 1 } } })
        );

        const error = await connector.signData({ type: 'text', text: 'hi' }).catch(e => e);

        expect(error).toBeInstanceOf(MethodNotSupportedError);
        expect(error.walletError).toEqual({
            code: 400,
            message: 'nope',
            data: { m: 1 },
            responseId: '0'
        });
        expect(failures(events, 'sign-data-request-failed')).toHaveLength(1);
    });

    it('signData: a text rejection becomes WalletTransportError, tracked once', async () => {
        const { connector, events } = await connected(() =>
            Promise.reject(new Error('Canceled by the user'))
        );

        await expect(connector.signData({ type: 'text', text: 'hi' })).rejects.toBeInstanceOf(
            WalletTransportError
        );
        expect(failures(events, 'sign-data-request-failed')).toHaveLength(1);
    });

    it('signMessage: Error("300") becomes UserRejectsError', async () => {
        const { connector } = await connected(() => Promise.reject(new Error('300')));

        await expect(connector.signMessage(tx)).rejects.toBeInstanceOf(UserRejectsError);
    });

    it('connect: Error("300") reaches the status error handler as UserRejectsError', async () => {
        const ctx = setup(() => undefined);
        ctx.wallet.connect = () => Promise.reject(new Error('300')) as never;
        const errors: TonConnectError[] = [];
        ctx.connector.onStatusChange(
            () => {},
            e => errors.push(e)
        );

        ctx.connector.connect({ jsBridgeKey: KEY });
        await new Promise(resolve => setTimeout(resolve, 0));

        expect(errors).toHaveLength(1);
        expect(errors[0]).toBeInstanceOf(UserRejectsError);
        expect(errors[0]!.walletError).toEqual({ code: 300, message: '300', normalized: true });
    });

    it('connect: a text rejection reaches the status error handler as WalletTransportError', async () => {
        const ctx = setup(() => undefined);
        ctx.wallet.connect = () => Promise.reject(new Error('closed')) as never;
        const errors: TonConnectError[] = [];
        ctx.connector.onStatusChange(
            () => {},
            e => errors.push(e)
        );

        ctx.connector.connect({ jsBridgeKey: KEY });
        await new Promise(resolve => setTimeout(resolve, 0));

        expect(errors).toHaveLength(1);
        expect(errors[0]).toBeInstanceOf(WalletTransportError);
    });
});

describe('TonConnect rejecting an injected wallet on connect', () => {
    it('reports missing features without an unhandled rejection when cleanup fails', async () => {
        const ctx = setup(() => undefined, {
            walletsRequiredFeatures: { sendTransaction: { minMessages: 10 } },
            removeItem: async () => {
                throw new Error('storage down');
            }
        });
        const errors: TonConnectError[] = [];
        ctx.connector.onStatusChange(
            () => {},
            e => errors.push(e)
        );
        const reasons: unknown[] = [];
        const record = (reason: unknown): void => void reasons.push(reason);
        process.on('unhandledRejection', record);

        try {
            ctx.connector.connect({ jsBridgeKey: KEY });
            for (let i = 0; i < 3; i++) {
                await new Promise(resolve => setTimeout(resolve, 0));
            }
        } finally {
            process.off('unhandledRejection', record);
        }

        expect(errors.map(e => e.name)).toEqual(['WalletMissingRequiredFeaturesError']);
        expect(reasons).toEqual([]);
    });
});
