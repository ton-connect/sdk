import { InMemoryStorage } from 'src/storage/models/in-memory-storage';

export function getWindow(): Window | undefined {
    if (typeof window === 'undefined') {
        return undefined;
    }

    return window;
}

/**
 * The function try to get window keys, if it is not available it returns empty array.
 * As an example, for Safari in private mode it returns empty array, because the browser does not allow to get window keys.
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
 * The function returns localStorage if it is available, for Safari in private mode it returns InMemoryStorage.
 */
export function tryGetLocalStorage(): Storage {
    try {
        return localStorage;
    } catch {
        return InMemoryStorage.getInstance();
    }
}
