export interface WalletErrorPayload {
    code: number;
    message: string;
    data?: unknown;
}

/**
 * The error payload of a wallet answer: an object whose `code` is a safe
 * integer. `message` falls back to an empty string and `data` is kept as is.
 * An `Error` instance qualifies, as the Tonkeeper extension resolves `{ error }` with one.
 */
export function walletErrorPayloadFrom(value: unknown): WalletErrorPayload | undefined {
    if (typeof value !== 'object' || value === null || Array.isArray(value)) {
        return undefined;
    }

    const source = value as Record<string, unknown>;
    const code = source.code;
    if (typeof code !== 'number' || !Number.isSafeInteger(code)) {
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
