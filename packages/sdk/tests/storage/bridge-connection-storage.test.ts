import { Base64, hexToByteArray, SessionCrypto } from '@tonconnect/protocol';
import { fetchMocker } from 'tests/setup';
import { BridgeConnectionStorage } from 'src/storage/bridge-connection-storage';
import { IStorage } from 'src/storage/models/storage.interface';
import { WalletsListManager } from 'src/wallets-list-manager';
import { BridgeConnectionHttpRaw } from 'src/provider/bridge/models/bridge-connection';
import { BridgeProvider } from 'src/provider/bridge/bridge-provider';

const STORE_KEY = 'ton-connect-storage_bridge-connection';
const PICKED_BRIDGE = 'https://picked-bridge.test';
const PICKED_LINK = 'https://picked.test/connect';
const OTHER_BRIDGE = 'https://other-bridge.test/bridge/';
const RETIRED_BRIDGE = 'https://retired-bridge.test/bridge';
const WALLETS_LIST_SOURCE = 'https://wallets.test/wallets-v2.json';

function wallet(appName: string, universalUrl: string, bridgeUrl: string): object {
    return {
        app_name: appName,
        name: appName,
        image: `https://wallets.test/${appName}.png`,
        about_url: `https://wallets.test/${appName}`,
        universal_url: universalUrl,
        bridge: [{ type: 'sse', url: bridgeUrl }],
        platforms: ['ios', 'android']
    };
}

const walletsList = [
    wallet('picked-wallet', PICKED_LINK, PICKED_BRIDGE),
    wallet('other-wallet', 'https://other.test/connect', OTHER_BRIDGE)
];

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

const device = (appName: string) => ({
    platform: 'android' as const,
    appName,
    appVersion: '1.0.0',
    maxProtocolVersion: 2,
    features: []
});

const tonAddr = {
    name: 'ton_addr' as const,
    address: '0:' + '0'.repeat(64),
    network: '-239' as const,
    walletStateInit: '',
    publicKey: '0'.repeat(64)
};

function storedConnection(
    bridgeUrl: string,
    deviceAppName: string,
    walletAppName?: string
): BridgeConnectionHttpRaw {
    return {
        type: 'http',
        nextRpcRequestId: 0,
        walletAppName,
        connectEvent: {
            event: 'connect',
            payload: { items: [tonAddr], device: device(deviceAppName) }
        },
        session: {
            sessionKeyPair: new SessionCrypto().stringifyKeypair(),
            walletPublicKey: '0'.repeat(64),
            bridgeUrl
        }
    };
}

describe('BridgeConnectionStorage bridge actualization', () => {
    let storage: MemoryStorage;
    let connectionStorage: BridgeConnectionStorage;

    const restoredBridgeUrl = async (stored: BridgeConnectionHttpRaw): Promise<string> => {
        await storage.setItem(STORE_KEY, JSON.stringify(stored));
        const connection = await connectionStorage.getHttpConnection();
        if (!('session' in connection)) {
            throw new Error('Expected an established connection');
        }
        return connection.session.bridgeUrl;
    };

    beforeEach(() => {
        fetchMocker.mockIf(WALLETS_LIST_SOURCE, () => ({ body: JSON.stringify(walletsList) }));
        storage = new MemoryStorage();
        connectionStorage = new BridgeConnectionStorage(
            storage,
            new WalletsListManager({ walletsListSource: WALLETS_LIST_SOURCE })
        );
    });

    afterEach(() => {
        fetchMocker.resetMocks();
    });

    it('keeps a session on the bridge of the wallet it was connected through', async () => {
        const stored = storedConnection(PICKED_BRIDGE, 'other-wallet', 'picked-wallet');

        expect(await restoredBridgeUrl(stored)).toBe(PICKED_BRIDGE);
    });

    it('moves a session to the new bridge of the wallet it was connected through', async () => {
        const stored = storedConnection(RETIRED_BRIDGE, 'Other Wallet', 'other-wallet');

        expect(await restoredBridgeUrl(stored)).toBe(OTHER_BRIDGE);
    });

    it('falls back to the device app name for sessions stored without the wallet', async () => {
        const stored = storedConnection(RETIRED_BRIDGE, 'other-wallet');

        expect(await restoredBridgeUrl(stored)).toBe(OTHER_BRIDGE);
    });

    it('keeps the wallet across later writes of the connection', async () => {
        await storage.setItem(
            STORE_KEY,
            JSON.stringify(storedConnection(PICKED_BRIDGE, 'other-wallet', 'picked-wallet'))
        );

        await connectionStorage.storeLastWalletEventId(5);
        await connectionStorage.increaseNextRpcRequestId();

        const stored: BridgeConnectionHttpRaw = JSON.parse((await storage.getItem(STORE_KEY))!);
        expect(stored.walletAppName).toBe('picked-wallet');
        expect(stored.session.bridgeUrl).toBe(PICKED_BRIDGE);
    });

    it('finds the wallet only by its own bridge and universal link', async () => {
        expect(await connectionStorage.findWalletAppName(PICKED_BRIDGE, PICKED_LINK)).toBe(
            'picked-wallet'
        );
        expect(
            await connectionStorage.findWalletAppName(OTHER_BRIDGE, PICKED_LINK)
        ).toBeUndefined();
    });

    const receiveConnectEvent = async (provider: BridgeProvider, id: number): Promise<void> => {
        const dappCrypto = new SessionCrypto();
        const walletCrypto = new SessionCrypto();
        const connectEvent = {
            event: 'connect',
            id,
            payload: { items: [tonAddr], device: device('other-wallet') }
        };
        provider['session'] = { sessionCrypto: dappCrypto, bridgeUrl: PICKED_BRIDGE };

        await provider['gatewayListener']({
            from: walletCrypto.sessionId,
            message: Base64.encode(
                walletCrypto.encrypt(
                    JSON.stringify(connectEvent),
                    hexToByteArray(dappCrypto.sessionId)
                )
            )
        });
    };

    it('records the picked wallet when the connect event arrives', async () => {
        const provider = new BridgeProvider(connectionStorage, {
            bridgeUrl: PICKED_BRIDGE,
            universalLink: PICKED_LINK
        });
        await vi.waitFor(() => expect(provider['walletAppName']).toBe('picked-wallet'));

        await receiveConnectEvent(provider, 1);

        const stored: BridgeConnectionHttpRaw = JSON.parse((await storage.getItem(STORE_KEY))!);
        expect(stored.walletAppName).toBe('picked-wallet');
        expect(await restoredBridgeUrl(stored)).toBe(PICKED_BRIDGE);
    });

    it('stores the connection without waiting for a wallets list request that never completes', async () => {
        fetchMocker.mockIf(WALLETS_LIST_SOURCE, () => new Promise(() => {}));
        const provider = new BridgeProvider(connectionStorage, {
            bridgeUrl: PICKED_BRIDGE,
            universalLink: PICKED_LINK
        });

        await receiveConnectEvent(provider, 1);

        const stored: BridgeConnectionHttpRaw = JSON.parse((await storage.getItem(STORE_KEY))!);
        expect(stored.session.bridgeUrl).toBe(PICKED_BRIDGE);
        expect(stored.walletAppName).toBeUndefined();
    });

    it('keeps the picked wallet when a restored connection receives another connect event', async () => {
        await storage.setItem(
            STORE_KEY,
            JSON.stringify(storedConnection(PICKED_BRIDGE, 'other-wallet', 'picked-wallet'))
        );
        const provider = await BridgeProvider.fromStorage(connectionStorage);

        await receiveConnectEvent(provider, 2);

        const stored: BridgeConnectionHttpRaw = JSON.parse((await storage.getItem(STORE_KEY))!);
        expect(stored.walletAppName).toBe('picked-wallet');
        expect(await restoredBridgeUrl(stored)).toBe(PICKED_BRIDGE);
    });
});
