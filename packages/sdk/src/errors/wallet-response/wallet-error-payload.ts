export interface WalletErrorPayload {
    code: number;
    message: string;
    data?: unknown;
}

/**
 * The error payload of a wallet answer: a plain object whose `code` is a safe
 * integer. `message` falls back to an empty string and `data` is kept as is.
 */
export function walletErrorPayloadFrom(value: unknown): WalletErrorPayload | undefined {
    if (Object.prototype.toString.call(value) !== '[object Object]') {
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
