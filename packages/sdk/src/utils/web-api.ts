export function getWindow(): Window | undefined {
    if (typeof window === 'undefined') {
        return undefined;
    }

    return window;
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
