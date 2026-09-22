export interface WalletErrorPayload {
    code: number;
    message: string;
    data?: unknown;
}

const CANONICAL_CODE = /^(0|[1-9][0-9]{0,2})$/;

function tagOf(value: unknown): string {
    return Object.prototype.toString.call(value);
}

function fromStructured(
    source: Record<string, unknown>,
    knownCodes: ReadonlySet<number>
): WalletErrorPayload | undefined {
    const code = source.code;
    if (typeof code !== 'number' || !Number.isSafeInteger(code) || !knownCodes.has(code)) {
        return undefined;
    }

    const payload: WalletErrorPayload = {
        code,
        message: typeof source.message === 'string' ? source.message : ''
    };
    if ('data' in source) {
        payload.data = source.data;
    }
    return payload;
}

/**
 * Compatibility with wallets whose injected bridge rejects the request
 * promise instead of resolving a TON Connect error response, e.g.
 * `reject(new Error(300))` or `reject({ code: 300, message })`.
 *
 * Only known codes are accepted, and a message counts as a code only in its
 * canonical decimal form. A rejection that carries the text "300" for another
 * reason is indistinguishable and will be read as code 300. Human-readable
 * text, localized or not, is never interpreted.
 */
export function legacyWalletErrorFrom(
    reason: unknown,
    knownCodes: ReadonlySet<number>
): WalletErrorPayload | undefined {
    try {
        const tag = tagOf(reason);

        // DOMException carries a numeric legacy `code` unrelated to TON Connect.
        if (tag === '[object DOMException]') {
            return undefined;
        }

        if (typeof reason === 'number') {
            return Number.isSafeInteger(reason) && knownCodes.has(reason)
                ? { code: reason, message: '' }
                : undefined;
        }

        if (tag === '[object Object]') {
            const record = reason as Record<string, unknown>;
            const source =
                tagOf(record.error) === '[object Object]'
                    ? (record.error as Record<string, unknown>)
                    : record;
            return fromStructured(source, knownCodes);
        }

        if (typeof reason === 'object' && reason !== null) {
            const message = (reason as { message?: unknown }).message;
            if (typeof message === 'string' && CANONICAL_CODE.test(message)) {
                const code = Number(message);
                return knownCodes.has(code) ? { code, message } : undefined;
            }
        }

        return undefined;
    } catch {
        return undefined;
    }
}
