import { WalletsListManager, type WalletInfo } from '@tonconnect/sdk';

/**
 * Shared wallets-list cache for widget-builder preview iframes.
 *
 * Every preview block is a separate iframe, so without sharing each one
 * re-fetches wallets-v2.json and every wallet icon. The builder page installs
 * the cache on its own window; preview iframes (same origin) pick it up via
 * `window.parent`. Icons are converted to blob URLs created in the builder
 * document, so they stay valid for all iframes while the builder is open.
 */

const PREVIEW_WALLETS_CACHE_KEY = '__tonConnectPreviewWalletsCache';

interface PreviewWalletsCache {
    getWallets: () => Promise<WalletInfo[]>;
}

type CacheHostWindow = Window & {
    [PREVIEW_WALLETS_CACHE_KEY]?: PreviewWalletsCache;
};

async function toCachedIconUrl(url: string): Promise<string> {
    try {
        const response = await fetch(url, { mode: 'cors' });

        if (!response.ok) {
            return url;
        }

        const blob = await response.blob();

        return URL.createObjectURL(blob);
    } catch {
        // Icon host without CORS — let the iframe load the original URL.
        return url;
    }
}

async function loadWalletsWithCachedIcons(): Promise<WalletInfo[]> {
    const wallets = await new WalletsListManager().getWallets();

    return Promise.all(
        wallets.map(async wallet => ({
            ...wallet,
            imageUrl: await toCachedIconUrl(wallet.imageUrl)
        }))
    );
}

function createPreviewWalletsCache(): PreviewWalletsCache {
    let walletsPromise: Promise<WalletInfo[]> | null = null;

    return {
        getWallets: () => {
            if (!walletsPromise) {
                walletsPromise = loadWalletsWithCachedIcons().catch(error => {
                    // Don't cache failures — let the next preview retry.
                    walletsPromise = null;
                    throw error;
                });
            }

            return walletsPromise;
        }
    };
}

/** Call on the builder page so preview iframes can share one wallets-list load. */
export function installPreviewWalletsCache(): void {
    const host = window as CacheHostWindow;

    if (!host[PREVIEW_WALLETS_CACHE_KEY]) {
        host[PREVIEW_WALLETS_CACHE_KEY] = createPreviewWalletsCache();
    }
}

/** Cache installed by the parent builder page, if this window is a preview iframe. */
export function getParentPreviewWalletsCache(): PreviewWalletsCache | null {
    try {
        if (window.parent === window) {
            return null;
        }

        return (window.parent as CacheHostWindow)[PREVIEW_WALLETS_CACHE_KEY] ?? null;
    } catch {
        // Cross-origin parent — no shared cache available.
        return null;
    }
}
