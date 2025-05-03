import { InMemoryStorage } from 'src/storage/models/in-memory-storage';
import { TonConnectError } from 'src/errors';

export function getWindow(): Window | undefined {
    if (typeof window === 'undefined') {
        return undefined;
    }

    return window;
}

/**
 * The function try to get window keys, if it is not available it returns empty array.
 * As an example, for Safari's private mode it returns empty array, because the browser does not allow to get window keys.
 */
export function tryGetWindowKeys(): string[] {
    const window = getWindow();
    if (!window) {
        return [];
    }

    try {
        return Object.keys(window);
    } catch {
        return [];
    }
}

export function getDocument(): Document | undefined {
    if (typeof document === 'undefined') {
        return undefined;
    }

    return document;
}

export function getWebPageManifest(): string {
    const origin = getWindow()?.location.origin;
    if (origin) {
        return origin + '/tonconnect-manifest.json';
    }

    return '';
}

/**
 * Returns `localStorage` if it is available. In Safari's private mode, it returns `InMemoryStorage`. In Node.js, it throws an error.
 */
export function tryGetLocalStorage(): Storage {
    if (isLocalStorageAvailable()) {
        return localStorage;
    }

    if (isNodeJs()) {
        throw new TonConnectError(
            '`localStorage` is unavailable, but it is required for TonConnect. For more details, see https://github.com/ton-connect/sdk/tree/main/packages/sdk#init-connector'
        );
    }

    return InMemoryStorage.getInstance();
}

/**
 * Checks if `localStorage` is available.
 */
function isLocalStorageAvailable(): boolean {
    // We use a try/catch block because Safari's private mode throws an error when attempting to access localStorage.
    try {
        return typeof localStorage !== 'undefined';
    } catch {
        return false;
    }
}

/**
 * Checks if the environment is Node.js.
 */
function isNodeJs(): boolean {
    return (
        typeof process !== 'undefined' && process.versions != null && process.versions.node != null
    );
}
