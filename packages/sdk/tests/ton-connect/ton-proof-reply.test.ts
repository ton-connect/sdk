import { describe, it, expect, vi } from 'vitest';

import { Wallet } from 'src/models';
import { InjectedProvider } from 'src/provider/injected/injected-provider';
import { TonConnect } from 'src/ton-connect';

// The bundler defines this at build time; the test config does not.
vi.hoisted(() => {
    (globalThis as Record<string, unknown>).TON_CONNECT_SDK_VERSION = '0.0.0-test';
});

const KEY = 'testwallet';
const PROOF = {
    timestamp: 1700000000,
    domain: { lengthBytes: 11, value: 'example.com' },
    payload: 'some-payload',
    signature: 'YWJjZA=='
};

function connectWith(proof: Record<string, unknown>): Promise<Wallet> {
    const device = {
        platform: 'iphone',
        appName: KEY,
        appVersion: '1.0.0',
        maxProtocolVersion: 2,
        features: []
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
                        address: '0:' + '3'.repeat(64),
                        network: '-239',
                        walletStateInit: '',
                        publicKey: ''
                    },
                    { name: 'ton_proof', proof }
                ]
            }
        })),
        restoreConnection: vi.fn(),
        send: vi.fn(),
        listen: vi.fn(() => () => {}),
        disconnect: vi.fn()
    };
    (InjectedProvider as unknown as { window: unknown }).window = { [KEY]: { tonconnect: wallet } };

    const map = new Map<string, string>();
    const connector = new TonConnect({
        manifestUrl: 'https://example.com/tonconnect-manifest.json',
        storage: {
            setItem: async (k: string, v: string) => void map.set(k, v),
            getItem: async (k: string) => map.get(k) ?? null,
            removeItem: async (k: string) => void map.delete(k)
        },
        analytics: { mode: 'off' },
        disableAutoPauseConnection: true
    });
    const status = new Promise<Wallet>(resolve =>
        connector.onStatusChange(connected => resolve(connected!))
    );
    connector.connect({ jsBridgeKey: KEY });
    return status;
}

describe('TonConnect reading the ton_proof of a connect event', () => {
    it('passes on a proof with only the four fields', async () => {
        const wallet = await connectWith(PROOF);

        expect(wallet.connectItems?.tonProof).toEqual({ name: 'ton_proof', proof: PROOF });
    });

    it.each([
        ['a field with a value', { stateInit: 'te6cc' }],
        ['a field set to undefined', { stateInit: undefined }]
    ])('passes on the four fields of a proof that also has %s', async (_, extra) => {
        const wallet = await connectWith({ ...PROOF, ...extra });

        const tonProof = wallet.connectItems?.tonProof;
        expect(tonProof).toEqual({ name: 'ton_proof', proof: PROOF });
        expect(Object.keys((tonProof as { proof: object }).proof).sort()).toEqual(
            Object.keys(PROOF).sort()
        );
    });

    it('still turns a proof with a field it cannot read into an error', async () => {
        const wallet = await connectWith({ ...PROOF, signature: 'not base64!' });

        expect(wallet.connectItems?.tonProof).toEqual({
            name: 'ton_proof',
            error: { code: 0, message: "Invalid 'proof.signature' format" }
        });
    });
});
