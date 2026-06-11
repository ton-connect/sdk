import {
    CHAIN,
    TonConnect,
    WalletsListManager,
    type ITonConnect,
    type Wallet,
    type WalletInfo
} from '@tonconnect/sdk';
import { TonConnectUI } from '@tonconnect/ui-react';

import { getParentPreviewWalletsCache } from './preview-wallets-cache';

/** Static universal link for QR / deep-link UI — no bridge SSE. */
const PREVIEW_MOCK_CONNECT_URL =
    'https://app.tonkeeper.com/ton-connect?v=2&id=0000000000000000000000000000000000000000000000000000000000000000&r=0000000000000000000000000000000000000000000000000000000000000000';

let previewWalletsPromise: Promise<WalletInfo[]> | null = null;

/**
 * Full Ton Connect wallets registry. Prefers the cache shared by the parent
 * builder page (one fetch of the list and icons for all preview iframes);
 * falls back to a per-iframe fetch when the page is opened standalone.
 */
function getPreviewWalletsList(): Promise<WalletInfo[]> {
    if (!previewWalletsPromise) {
        previewWalletsPromise =
            getParentPreviewWalletsCache()?.getWallets() ?? new WalletsListManager().getWallets();
    }

    return previewWalletsPromise;
}

export function prefetchPreviewWalletsList(): void {
    void getPreviewWalletsList();
}

const PREVIEW_MOCK_WALLET: Wallet = {
    device: {
        appName: 'tonkeeper',
        appVersion: '1.0.0',
        maxProtocolVersion: 2,
        platform: 'browser',
        features: [
            { name: 'SendTransaction', maxMessages: 4 },
            { name: 'SignData', types: ['text', 'binary', 'cell'] },
            { name: 'SignMessage', maxMessages: 4 }
        ]
    },
    provider: 'injected',
    account: {
        address: '0:4d5c0210b35daddaa219fac459dba0fdefb1fae4e97a0d0797739fe050d694ca',
        chain: CHAIN.MAINNET,
        publicKey: '1111111111111111111111111111111111111111111111111111111111111111',
        walletStateInit:
            'te6cckEBBAEAOgACATQCAQAAART/APSkE/S88sgLAwBI0wHQ0wMBcbCRW+D6QDBwgBDIywVYzxYh+gLLagHPFsmAQPsAlxCarA=='
    }
};

type ConnectorWithWallet = ITonConnect & { wallet: Wallet | null };

type ConnectorInternals = ITonConnect & {
    walletsList?: { getWallets: () => Promise<WalletInfo[]> };
};

type ConnectorPreviewMocks = {
    getWallets: ITonConnect['getWallets'];
    connect: ITonConnect['connect'];
    walletsListGetWallets?: () => Promise<WalletInfo[]>;
};

function mockGetWallets(): Promise<WalletInfo[]> {
    return getPreviewWalletsList();
}

/** Block wallet deep-link redirects inside preview iframes. */
export function installPreviewNavigationGuards(): () => void {
    const originalOpen = window.open.bind(window);

    window.open = ((url?: string | URL, target?: string, features?: string) => {
        void url;
        void target;
        void features;
        return null;
    }) as typeof window.open;

    return () => {
        window.open = originalOpen;
    };
}

function mockConnect(...args: Parameters<ITonConnect['connect']>): string | void {
    const wallet = args[0];

    if (
        wallet &&
        !Array.isArray(wallet) &&
        'jsBridgeKey' in wallet &&
        typeof wallet.jsBridgeKey === 'string'
    ) {
        return undefined;
    }

    return PREVIEW_MOCK_CONNECT_URL;
}

/** Patches connector instance — blocks bridge SSE and remote wallets-list fetch. */
export function applyConnectorPreviewMocks(connector: ITonConnect): () => void {
    const originals: ConnectorPreviewMocks = {
        getWallets: connector.getWallets.bind(connector),
        connect: connector.connect.bind(connector)
    };

    const internals = connector as ConnectorInternals;

    if (internals.walletsList) {
        originals.walletsListGetWallets = internals.walletsList.getWallets.bind(
            internals.walletsList
        );
        internals.walletsList.getWallets = mockGetWallets;
    }

    connector.getWallets = mockGetWallets;
    connector.connect = mockConnect as ITonConnect['connect'];

    return () => {
        connector.getWallets = originals.getWallets;
        connector.connect = originals.connect;

        if (internals.walletsList && originals.walletsListGetWallets) {
            internals.walletsList.getWallets = originals.walletsListGetWallets;
        }
    };
}

let staticPreviewMocksInstalled = false;
// eslint-disable-next-line unused-imports/no-unused-vars
let staticPreviewMocksCleanup: (() => void) | null = null;

function ensureStaticPreviewMocks(): void {
    if (staticPreviewMocksInstalled) {
        return;
    }

    const originalStaticGetWallets = TonConnect.getWallets.bind(TonConnect);

    TonConnect.getWallets = mockGetWallets;
    staticPreviewMocksInstalled = true;
    staticPreviewMocksCleanup = () => {
        TonConnect.getWallets = originalStaticGetWallets;
        staticPreviewMocksInstalled = false;
        staticPreviewMocksCleanup = null;
    };
}

export function createPreviewConnector(manifestUrl: string): TonConnect {
    prefetchPreviewWalletsList();
    const connector = new TonConnect({ manifestUrl });
    applyConnectorPreviewMocks(connector);
    ensureStaticPreviewMocks();
    return connector;
}

const CLEAR_ACTION_WAIT_MS = 100;

/** Clears action modals/notifications and restores the mock wallet for the next preview run. */
export async function resetPreviewActionUi(tonConnectUI: TonConnectUI): Promise<void> {
    await tonConnectUI.disconnect().catch(() => {});
    await new Promise<void>(resolve => {
        window.setTimeout(resolve, CLEAR_ACTION_WAIT_MS);
    });
    setPreviewConnectedWallet(tonConnectUI.connector);
}

export function setPreviewConnectedWallet(connector: ITonConnect): void {
    (connector as ConnectorWithWallet).wallet = PREVIEW_MOCK_WALLET;
}

export function clearPreviewConnectedWallet(connector: ITonConnect): void {
    (connector as ConnectorWithWallet).wallet = null;
}

/** Full preview mocks for an existing TonConnectUI instance (iframe page). */
export function installPreviewMocks(tonConnectUI: TonConnectUI): () => void {
    prefetchPreviewWalletsList();
    ensureStaticPreviewMocks();

    const cleanupConnector = applyConnectorPreviewMocks(tonConnectUI.connector);
    const cleanupNavigation = installPreviewNavigationGuards();
    const originalUiStaticGetWallets = TonConnectUI.getWallets.bind(TonConnectUI);

    TonConnectUI.getWallets = mockGetWallets;

    return () => {
        cleanupConnector();
        cleanupNavigation();
        TonConnectUI.getWallets = originalUiStaticGetWallets;
    };
}
