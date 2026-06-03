import { TonConnectError } from '@tonconnect/sdk';

const SDK_ERROR_PREFIX = '[TON_CONNECT_SDK_ERROR]';

/** Known TonConnect error classes mapped to wallet RPC error codes (protocol). */
const ERROR_CLASS_TO_CODE: Record<string, number> = {
    UnknownError: 0,
    BadRequestError: 1,
    UnknownAppError: 100,
    UserRejectsError: 300,
    MethodNotSupportedError: 400
};

export type NormalizedOperationError = {
    errorClass?: string;
    message: string;
    sdkMessage?: string;
    walletMessage?: string;
    walletResponse?: unknown;
    sdkError?: boolean;
};

function parseSdkErrorString(text: string): Omit<NormalizedOperationError, 'walletResponse'> {
    const match = text.match(/^\[TON_CONNECT_SDK_ERROR\]\s*([^:]+):\s*([\s\S]*)$/);
    if (!match) {
        return { message: text, sdkError: text.includes(SDK_ERROR_PREFIX) };
    }

    const errorClass = match[1].trim();
    const body = match[2];
    const newlineIndex = body.indexOf('\n');

    if (newlineIndex >= 0) {
        const sdkMessage = body.slice(0, newlineIndex).trim();
        const walletMessage = body.slice(newlineIndex + 1).trim();
        return {
            errorClass,
            message: walletMessage || sdkMessage || text,
            sdkMessage: sdkMessage || undefined,
            walletMessage: walletMessage || undefined,
            sdkError: true
        };
    }

    const message = body.trim() || text;
    return { errorClass, message, sdkMessage: message, sdkError: true };
}

function buildWalletResponse(
    errorClass: string | undefined,
    walletMessage: string | undefined
): unknown | undefined {
    if (!walletMessage) {
        return undefined;
    }

    const code = errorClass ? ERROR_CLASS_TO_CODE[errorClass] : undefined;
    const error: Record<string, unknown> = { message: walletMessage };
    if (code !== undefined) {
        error.code = code;
    }

    return { error };
}

function extractWalletMessage(value: unknown): string {
    if (value && typeof value === 'object' && value !== null) {
        const record = value as Record<string, unknown>;
        const err = record.error;
        if (err && typeof err === 'object' && err !== null) {
            const errRecord = err as Record<string, unknown>;
            const message = errRecord.message;
            if (message !== undefined) {
                return String(message);
            }
            return JSON.stringify(err);
        }
        if (typeof err === 'string') {
            return err;
        }
    }
    if (typeof value === 'string') {
        return value;
    }
    return 'Operation failed';
}

function finalizeNormalized(
    partial: Omit<NormalizedOperationError, 'walletResponse'> & { walletResponse?: unknown }
): NormalizedOperationError {
    if (partial.walletResponse !== undefined) {
        return partial as NormalizedOperationError;
    }

    const walletResponse = buildWalletResponse(partial.errorClass, partial.walletMessage);
    if (walletResponse === undefined) {
        return partial;
    }

    return { ...partial, walletResponse };
}

/**
 * Turns wallet/SDK failures into a stable shape for {@link ResultBlock}.
 * Preserves raw wallet payloads when present; otherwise reconstructs `walletResponse`
 * from the TonConnect SDK error string (code + wallet message).
 */
export function normalizeOperationError(error: unknown): NormalizedOperationError | null {
    if (error == null || error === undefined) {
        return null;
    }

    if (typeof error === 'string') {
        return finalizeNormalized(parseSdkErrorString(error));
    }

    if (error instanceof TonConnectError) {
        const parsed = parseSdkErrorString(error.message);
        return finalizeNormalized({
            ...parsed,
            errorClass: parsed.errorClass ?? error.constructor.name
        });
    }

    if (error instanceof Error) {
        if (error.message.includes(SDK_ERROR_PREFIX)) {
            const parsed = parseSdkErrorString(error.message);
            return finalizeNormalized({
                ...parsed,
                errorClass: parsed.errorClass ?? error.name
            });
        }
        return { message: error.message, errorClass: error.name };
    }

    if (typeof error === 'object') {
        const record = error as Record<string, unknown>;

        if ('error' in record && typeof record.error === 'string' && !('errorClass' in record)) {
            return { message: record.error };
        }

        if ('jetton' in record || 'transaction' in record) {
            return finalizeNormalized({
                message: 'Wallet rejected the action',
                walletResponse: error
            });
        }

        if ('error' in record || 'id' in record) {
            return finalizeNormalized({
                message: extractWalletMessage(record),
                walletResponse: error
            });
        }
    }

    return null;
}

export function formatOperationErrorForDisplay(error: unknown): string {
    const normalized = normalizeOperationError(error);
    if (!normalized) {
        if (typeof error === 'string') {
            return JSON.stringify({ message: error }, null, 2);
        }
        if (error instanceof Error) {
            return JSON.stringify({ message: error.message, errorClass: error.name }, null, 2);
        }
        return JSON.stringify({ message: 'Operation failed' }, null, 2);
    }

    const { walletMessage, sdkError, ...display } = normalized;
    void walletMessage;
    void sdkError;

    return JSON.stringify(display, null, 2);
}
