export function logDebug(...args: Parameters<Console['debug']>): void {
    if (typeof 'console' !== undefined) {
        try {
            console.debug('[TON_CONNECT_SDK]', ...args);
        } catch {}
    }
}

export function logError(...args: Parameters<Console['error']>): void {
    if (typeof 'console' !== undefined) {
        try {
            console.error('[TON_CONNECT_SDK]', ...args);
        } catch {}
    }
}

export function logWarning(...args: Parameters<Console['warn']>): void {
    if (typeof 'console' !== undefined) {
        try {
            console.warn('[TON_CONNECT_SDK]', ...args);
        } catch {}
    }
}


