import { beforeAll, describe, it, expect, vi } from 'vitest';
import {
    TonConnect,
    TonConnectError,
    toUserFriendlyAddress,
    UserRejectsError,
    WalletTransportError
} from '@tonconnect/sdk';

import { TonConnectUI } from 'src/ton-connect-ui';

const KEY = 'testwallet';
const ADDRESS = '0:' + '3'.repeat(64);

// Wallet methods that reject are plain functions, not vi.fn: a spy attaches its own
// handler to every promise it returns, which would hide an unhandled rejection.
function injectWallet(send: () => unknown): void {
    const device = {
        platform: 'iphone',
        appName: KEY,
        appVersion: '1.0.0',
        maxProtocolVersion: 2,
        features: [{ name: 'SendTransaction', maxMessages: 4 }]
    };
    (window as unknown as Record<string, unknown>)[KEY] = {
        tonconnect: {
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
        }
    };
}

async function connectedUI(send: () => unknown): Promise<TonConnectUI> {
    injectWallet(send);
    const map = new Map<string, string>();
    const connector = new TonConnect({
        manifestUrl: 'https://example.com/tonconnect-manifest.json',
        storage: {
            setItem: async (k: string, v: string) => void map.set(k, v),
            getItem: async (k: string) => map.get(k) ?? null,
            removeItem: async (k: string) => void map.delete(k)
        },
        analytics: { mode: 'off' }
    });
    const ui = new TonConnectUI({ connector });
    const status = new Promise(resolve => connector.onStatusChange(resolve));
    connector.connect({ jsBridgeKey: KEY });
    await status;
    return ui;
}

// jsdom has no matchMedia; the widget reads it for the color scheme.
beforeAll(() => {
    window.matchMedia = ((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => false
    })) as typeof window.matchMedia;
});

const tx = () => ({
    validUntil: Math.floor(Date.now() / 1000) + 120,
    messages: [{ address: toUserFriendlyAddress(ADDRESS), amount: '1' }]
});

describe('TonConnectUI.sendTransaction with an injected wallet that rejects', () => {
    it('passes Error("300") to the dApp as UserRejectsError, not as an unhandled error', async () => {
        const ui = await connectedUI(() => Promise.reject(new Error('300')));

        const error = await ui
            .sendTransaction(tx(), { modals: [], notifications: [] })
            .catch(e => e);

        expect(error).toBeInstanceOf(UserRejectsError);
        expect(error.message).not.toContain('Unhandled error');
        expect(error.walletError.code).toBe(300);
    });

    it('passes a text rejection to the dApp as WalletTransportError', async () => {
        const ui = await connectedUI(() => Promise.reject(new Error('Canceled by the user')));

        const error = await ui
            .sendTransaction(tx(), { modals: [], notifications: [] })
            .catch(e => e);

        expect(error).toBeInstanceOf(WalletTransportError);
        expect(error).toBeInstanceOf(TonConnectError);
        expect(error.message).not.toContain('Unhandled error');
    });
});
