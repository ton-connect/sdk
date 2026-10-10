import { describe, it, expect, vi } from 'vitest';

import { InjectedProvider } from 'src/provider/injected/injected-provider';
import { TonConnect } from 'src/ton-connect';

// The bundler defines this at build time; the test config does not.
vi.hoisted(() => {
    (globalThis as Record<string, unknown>).TON_CONNECT_SDK_VERSION = '0.0.0-test';
});

const KEY = 'testwallet';

type Dispatched = { type: string; trace_id?: string | null };

function connectorWithWallet() {
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
        isWalletBrowser: false,
        connect: vi.fn(() => new Promise(() => {})),
        restoreConnection: vi.fn(),
        send: vi.fn(),
        listen: vi.fn(() => () => {}),
        disconnect: vi.fn()
    };
    (InjectedProvider as unknown as { window: unknown }).window = { [KEY]: { tonconnect: wallet } };

    const events: Dispatched[] = [];
    const map = new Map<string, string>();
    const connector = new TonConnect({
        manifestUrl: 'https://example.com/tonconnect-manifest.json',
        storage: {
            setItem: async (k: string, v: string) => void map.set(k, v),
            getItem: async (k: string) => map.get(k) ?? null,
            removeItem: async (k: string) => void map.delete(k)
        },
        analytics: { mode: 'off' },
        disableAutoPauseConnection: true,
        eventDispatcher: {
            dispatchEvent: async (_name: string, detail: Dispatched) => void events.push(detail),
            addEventListener: async () => () => {}
        } as never
    });
    return { connector, events };
}

async function connectionEvents(events: Dispatched[]): Promise<Dispatched[]> {
    await new Promise(resolve => setTimeout(resolve, 0));
    return events.filter(
        e => e.type === 'connection-initiated' || e.type === 'connection-link-generated'
    );
}

describe('TonConnect.connect options', () => {
    it.each([
        [
            'the options overload',
            (connector: TonConnect) =>
                connector.connect({ jsBridgeKey: KEY }, { linkDisplayOnly: true, traceId: 't-1' })
        ],
        [
            'the deprecated three-argument form',
            (connector: TonConnect) =>
                connector.connect({ jsBridgeKey: KEY }, undefined, {
                    linkDisplayOnly: true,
                    traceId: 't-1'
                })
        ]
    ])(
        'reports a display-only connect through %s as connection-link-generated',
        async (_name, call) => {
            const { connector, events } = connectorWithWallet();

            call(connector);

            expect(await connectionEvents(events)).toMatchObject([
                { type: 'connection-link-generated', trace_id: 't-1' }
            ]);
        }
    );

    it('keeps the trace id passed through the options overload', async () => {
        const { connector, events } = connectorWithWallet();

        connector.connect({ jsBridgeKey: KEY }, { traceId: 't-2' });

        expect(await connectionEvents(events)).toMatchObject([
            { type: 'connection-initiated', trace_id: 't-2' }
        ]);
    });
});
