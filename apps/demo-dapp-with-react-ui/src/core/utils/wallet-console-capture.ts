/** Last wallet RPC error body logged by `@tonconnect/sdk` (`Wallet message received:`). */
let lastWalletRpcError: Record<string, unknown> | null = null;

const TON_CONNECT_LOG_PREFIX = '[TON_CONNECT_SDK]';
const WALLET_MESSAGE_LABEL = 'Wallet message received:';

const isWalletRpcError = (value: unknown): value is Record<string, unknown> => {
    if (!value || typeof value !== 'object' || value === null) {
        return false;
    }
    const record = value as Record<string, unknown>;
    const err = record.error;
    return err !== undefined && typeof err === 'object' && err !== null;
};

const captureFromConsoleArgs = (args: unknown[]): void => {
    const hasTonConnectPrefix =
        args[0] === TON_CONNECT_LOG_PREFIX || args.some(a => a === TON_CONNECT_LOG_PREFIX);
    if (!hasTonConnectPrefix) {
        return;
    }

    const labelIndex = args.findIndex(
        arg => typeof arg === 'string' && arg.includes(WALLET_MESSAGE_LABEL)
    );
    if (labelIndex < 0) {
        return;
    }

    const payload = args[labelIndex + 1];
    if (isWalletRpcError(payload)) {
        lastWalletRpcError = payload;
    }
};

type ConsoleMethod = (...args: unknown[]) => void;

const patchConsoleMethod = (
    method: 'debug' | 'log' | 'info'
): (() => void) => {
    const original = console[method].bind(console) as ConsoleMethod;

    const patched: ConsoleMethod = (...args: unknown[]) => {
        captureFromConsoleArgs(args);
        return original(...args);
    };

    if (method === 'debug') {
        console.debug = patched as typeof console.debug;
    } else if (method === 'log') {
        console.log = patched as typeof console.log;
    } else {
        console.info = patched as typeof console.info;
    }

    return () => {
        if (method === 'debug') {
            console.debug = original as typeof console.debug;
        } else if (method === 'log') {
            console.log = original as typeof console.log;
        } else {
            console.info = original as typeof console.info;
        }
    };
};

let restoreConsole: (() => void) | null = null;

/**
 * Intercepts `[TON_CONNECT_SDK] Wallet message received:` console lines and keeps
 * the latest wallet RPC error payload for the demo Result block.
 */
export function installWalletConsoleCapture(): void {
    if (typeof window === 'undefined' || restoreConsole) {
        return;
    }

    const restoreDebug = patchConsoleMethod('debug');
    const restoreLog = patchConsoleMethod('log');
    restoreConsole = () => {
        restoreDebug();
        restoreLog();
        restoreConsole = null;
    };
}

export function consumeLastWalletConsoleError(): Record<string, unknown> | null {
    const snapshot = lastWalletRpcError;
    lastWalletRpcError = null;
    return snapshot;
}
