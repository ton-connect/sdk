import { TonConnectError } from '@tonconnect/sdk';

import { consumeLastWalletConsoleError } from './wallet-console-capture';

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

function isKnownErrorClass(name: string | undefined): name is keyof typeof ERROR_CLASS_TO_CODE {
    return !!name && name in ERROR_CLASS_TO_CODE;
}

function resolveErrorClass(parsed?: string): string | undefined {
    if (parsed && isKnownErrorClass(parsed)) {
        return parsed;
    }
    if (parsed && parsed.length > 2 && parsed !== 'Error') {
        return parsed;
    }
    return undefined;
}

function parseSdkErrorString(text: string): Omit<NormalizedOperationError, 'walletResponse'> {
    const match = text.match(/^\[TON_CONNECT_SDK_ERROR\]\s*([^:]+):\s*([\s\S]*)$/);
    if (!match) {
        return { message: text, sdkError: text.includes(SDK_ERROR_PREFIX) };
    }

    const errorClass = resolveErrorClass(match[1].trim());
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

    const error: Record<string, unknown> = { message: walletMessage };
    const code = errorClass && isKnownErrorClass(errorClass) ? ERROR_CLASS_TO_CODE[errorClass] : undefined;
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

function applyConsoleCapture(partial: NormalizedOperationError): NormalizedOperationError {
    const fromConsole = consumeLastWalletConsoleError();
    if (fromConsole) {
        return {
            ...partial,
            message: extractWalletMessage(fromConsole),
            walletResponse: fromConsole
        };
    }

    if (partial.walletResponse !== undefined) {
        return partial;
    }

    const walletResponse = buildWalletResponse(partial.errorClass, partial.walletMessage);
    if (walletResponse === undefined) {
        return partial;
    }

    return { ...partial, walletResponse };
}

function normalizeFromErrorInstance(error: Error): NormalizedOperationError {
    if (error.message.includes(SDK_ERROR_PREFIX)) {
        const parsed = parseSdkErrorString(error.message);
        return applyConsoleCapture({
            ...parsed,
            errorClass: resolveErrorClass(parsed.errorClass)
        });
    }

    return applyConsoleCapture({ message: error.message });
}

/**
 * Turns wallet/SDK failures into a stable shape for {@link ResultBlock}.
 * Enriches SDK errors with the last `Wallet message received:` object from console (demo-only).
 */
export function normalizeOperationError(error: unknown): NormalizedOperationError | null {
    if (error == null || error === undefined) {
        return null;
    }

    if (typeof error === 'string') {
        return applyConsoleCapture(parseSdkErrorString(error));
    }

    if (error instanceof TonConnectError || error instanceof Error) {
        return normalizeFromErrorInstance(error);
    }

    if (typeof error === 'object') {
        const record = error as Record<string, unknown>;

        if ('error' in record && typeof record.error === 'string' && !('errorClass' in record)) {
            return { message: record.error };
        }

        if ('jetton' in record || 'transaction' in record) {
            return applyConsoleCapture({
                message: 'Wallet rejected the action',
                walletResponse: error
            });
        }

        if ('error' in record || 'id' in record) {
            return applyConsoleCapture({
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
            return JSON.stringify({ message: error.message }, null, 2);
        }
        return JSON.stringify({ message: 'Operation failed' }, null, 2);
    }

    const { walletMessage, sdkError, ...display } = normalized;
    void walletMessage;
    void sdkError;

    return JSON.stringify(display, null, 2);
}
