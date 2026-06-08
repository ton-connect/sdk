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

const wrapConsoleMethod = (original: ConsoleMethod): ConsoleMethod => {
    return (...args: unknown[]) => {
        captureFromConsoleArgs(args);
        return original(...args);
    };
};

const patchConsoleDebug = (): (() => void) => {
    const original = console.debug.bind(console);
    console.debug = wrapConsoleMethod(original) as typeof console.debug;
    return () => {
        console.debug = original;
    };
};

/** SDK also logs wallet RPC lines via `console.log`. */
const patchConsoleLog = (): (() => void) => {
    /* eslint-disable no-console -- intercept SDK wallet message lines for demo Result */
    const original = console.log.bind(console);
    console.log = wrapConsoleMethod(original) as typeof console.log;
    /* eslint-enable no-console */

    return () => {
        /* eslint-disable no-console -- restore patched console.log */
        console.log = original;
        /* eslint-enable no-console */
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

    const restoreDebug = patchConsoleDebug();
    const restoreLog = patchConsoleLog();
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
