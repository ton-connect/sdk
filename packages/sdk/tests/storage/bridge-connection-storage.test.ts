import { describe, expect, it } from 'vitest';
import { SessionCrypto } from '@tonconnect/protocol';
import { fetchMocker } from 'tests/setup';
import { BridgeConnectionStorage } from 'src/storage/bridge-connection-storage';
import { IStorage } from 'src/storage/models/storage.interface';
import { WalletsListManager } from 'src/wallets-list-manager';
import { WalletInfoDTO } from 'src/models/wallet/wallet-info';

const STORE_KEY = 'ton-connect-storage_bridge-connection';
const TELEGRAM_BRIDGE = 'https://tonbridge.telegram.org';
const GRAM_WALLET_BRIDGE = 'https://tonconnectbridge.mytonwallet.org/bridge/';

function remoteWallet(appName: string, bridgeUrl: string, universalUrl: string): WalletInfoDTO {
    return {
        app_name: appName,
        name: appName,
        image: `https://example.com/${appName}.png`,
        about_url: 'https://example.com',
        universal_url: universalUrl,
        bridge: [
            { type: 'js', key: appName },
            { type: 'sse', url: bridgeUrl }
        ],
        platforms: ['ios', 'android']
    };
}

const walletsList: WalletInfoDTO[] = [
    remoteWallet('telegram', TELEGRAM_BRIDGE, 'https://t.me/sendgrams'),
    remoteWallet('gramwallet', GRAM_WALLET_BRIDGE, 'https://connect.gramwallet.io')
];

function memoryStorage(): IStorage & { items: Map<string, string> } {
    const items = new Map<string, string>();
    return {
        items,
        async getItem(key) {
            return items.get(key) ?? null;
        },
        async setItem(key, value) {
            items.set(key, value);
        },
        async removeItem(key) {
            items.delete(key);
        }
    };
}

function storeHttpConnection(storage: IStorage, bridgeUrl: string, appName: string): string {
    const raw = JSON.stringify({
        type: 'http',
        connectEvent: {
            id: 1,
            event: 'connect',
            payload: {
                device: {
                    platform: 'android',
                    appName,
                    appVersion: '13.0.1',
                    maxProtocolVersion: 2,
                    features: []
                },
                items: []
            }
        },
        session: {
            sessionKeyPair: new SessionCrypto().stringifyKeypair(),
            walletPublicKey: 'wallet-public-key',
            bridgeUrl
        },
        lastWalletEventId: 1,
        nextRpcRequestId: 1
    });
    void storage.setItem(STORE_KEY, raw);
    return raw;
}

describe('BridgeConnectionStorage bridge actualization', () => {
    function connectionStorage(storage: IStorage): BridgeConnectionStorage {
        const walletsListManager = new WalletsListManager();
        fetchMocker.mockIf(walletsListManager['walletsListSource'], () => ({
            body: JSON.stringify(walletsList)
        }));
        return new BridgeConnectionStorage(storage, walletsListManager);
    }

    it("keeps a restored session on Telegram's bridge when the wallet reports another wallet's appName", async () => {
        const storage = memoryStorage();
        const raw = storeHttpConnection(storage, TELEGRAM_BRIDGE, 'gramwallet');

        const connection = await connectionStorage(storage).getHttpConnection();

        expect('session' in connection && connection.session.bridgeUrl).toBe(TELEGRAM_BRIDGE);
        expect(storage.items.get(STORE_KEY)).toBe(raw);
    });

    it('moves a restored session to the wallet bridge once its old bridge leaves the list', async () => {
        const storage = memoryStorage();
        storeHttpConnection(storage, 'https://retired-bridge.example.com/bridge', 'gramwallet');

        const connection = await connectionStorage(storage).getHttpConnection();

        expect('session' in connection && connection.session.bridgeUrl).toBe(GRAM_WALLET_BRIDGE);
        expect(JSON.parse(storage.items.get(STORE_KEY)!).session.bridgeUrl).toBe(
            GRAM_WALLET_BRIDGE
        );
    });

    it('keeps a session on a retired bridge when no wallet matches its appName', async () => {
        const storage = memoryStorage();
        storeHttpConnection(storage, 'https://retired-bridge.example.com/bridge', 'Tonkeeper');

        const connection = await connectionStorage(storage).getHttpConnection();

        expect('session' in connection && connection.session.bridgeUrl).toBe(
            'https://retired-bridge.example.com/bridge'
        );
    });
});
