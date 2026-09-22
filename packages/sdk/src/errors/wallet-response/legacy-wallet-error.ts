import {
    WalletErrorPayload,
    walletErrorPayloadFrom
} from 'src/errors/wallet-response/wallet-error-payload';

const CANONICAL_CODE = /^(0|[1-9][0-9]{0,2})$/;

function tagOf(value: unknown): string {
    return Object.prototype.toString.call(value);
}

function known(
    payload: WalletErrorPayload | undefined,
    knownCodes: ReadonlySet<number>
): WalletErrorPayload | undefined {
    return payload && knownCodes.has(payload.code) ? payload : undefined;
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
            return Number.isSafeInteger(reason)
                ? known({ code: reason, message: '' }, knownCodes)
                : undefined;
        }

        if (tag === '[object Object]') {
            const record = reason as Record<string, unknown>;
            const source =
                tagOf(record.error) === '[object Object]'
                    ? (record.error as Record<string, unknown>)
                    : record;
            return known(walletErrorPayloadFrom(source), knownCodes);
        }

        if (typeof reason === 'object' && reason !== null) {
            const message = (reason as { message?: unknown }).message;
            return typeof message === 'string' && CANONICAL_CODE.test(message)
                ? known({ code: Number(message), message }, knownCodes)
                : undefined;
        }

        return undefined;
    } catch {
        return undefined;
    }
}
