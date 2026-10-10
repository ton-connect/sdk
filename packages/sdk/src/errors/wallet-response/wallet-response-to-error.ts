import { CONNECT_EVENT_ERROR_CODES, SEND_TRANSACTION_ERROR_CODES } from '@tonconnect/protocol';
import { ManifestContentErrorError } from 'src/errors/protocol/events/connect/manifest-content-error.error';
import { ManifestNotFoundError } from 'src/errors/protocol/events/connect/manifest-not-found.error';
import { UserRejectsError } from 'src/errors/protocol/events/connect/user-rejects.error';
import { BadRequestError } from 'src/errors/protocol/responses/bad-request.error';
import { MethodNotSupportedError } from 'src/errors/protocol/responses/method-not-supported.error';
import { UnknownAppError } from 'src/errors/protocol/responses/unknown-app.error';
import { TonConnectError, WalletErrorDetail } from 'src/errors/ton-connect.error';
import { UnknownError } from 'src/errors/unknown.error';
import { attachedErrorOf, isNormalized } from 'src/errors/wallet-response/marks';

type WalletErrorTable = Readonly<Record<number, typeof TonConnectError>>;

/**
 * Error classes for `sendTransaction`, `signData` and `signMessage` responses.
 * The three methods share the same codes.
 */
export const RPC_WALLET_ERRORS: WalletErrorTable = {
    [SEND_TRANSACTION_ERROR_CODES.UNKNOWN_ERROR]: UnknownError,
    [SEND_TRANSACTION_ERROR_CODES.BAD_REQUEST_ERROR]: BadRequestError,
    [SEND_TRANSACTION_ERROR_CODES.UNKNOWN_APP_ERROR]: UnknownAppError,
    [SEND_TRANSACTION_ERROR_CODES.USER_REJECTS_ERROR]: UserRejectsError,
    [SEND_TRANSACTION_ERROR_CODES.METHOD_NOT_SUPPORTED]: MethodNotSupportedError
};

/** Error classes for `connect_error` events. */
export const CONNECT_WALLET_ERRORS: WalletErrorTable = {
    [CONNECT_EVENT_ERROR_CODES.UNKNOWN_ERROR]: UnknownError,
    [CONNECT_EVENT_ERROR_CODES.BAD_REQUEST_ERROR]: BadRequestError,
    [CONNECT_EVENT_ERROR_CODES.MANIFEST_NOT_FOUND_ERROR]: ManifestNotFoundError,
    [CONNECT_EVENT_ERROR_CODES.MANIFEST_CONTENT_ERROR]: ManifestContentErrorError,
    [CONNECT_EVENT_ERROR_CODES.UNKNOWN_APP_ERROR]: UnknownAppError,
    [CONNECT_EVENT_ERROR_CODES.USER_REJECTS_ERROR]: UserRejectsError,
    [CONNECT_EVENT_ERROR_CODES.METHOD_NOT_SUPPORTED]: MethodNotSupportedError
};

function codesOf(table: WalletErrorTable): ReadonlySet<number> {
    return new Set(Object.keys(table).map(Number));
}

export const RPC_WALLET_ERROR_CODES = codesOf(RPC_WALLET_ERRORS);
export const CONNECT_WALLET_ERROR_CODES = codesOf(CONNECT_WALLET_ERRORS);

/**
 * Builds the error a dApp receives for a wallet error payload. An unknown
 * code becomes `UnknownError`; the payload itself is kept in `walletError`.
 */
export function walletResponseToError(
    error: { code: number; message?: string; data?: unknown },
    table: WalletErrorTable,
    context: { responseId?: string } = {}
): TonConnectError {
    const attached = attachedErrorOf(error);
    if (attached) {
        return attached;
    }

    const walletError: WalletErrorDetail = { code: error.code, message: error.message ?? '' };
    if (error.data !== undefined) {
        walletError.data = error.data;
    }
    if (context.responseId !== undefined) {
        walletError.responseId = context.responseId;
    }
    if (isNormalized(error)) {
        walletError.normalized = true;
    }

    const ErrorClass = table[error.code] ?? UnknownError;
    return new ErrorClass(error.message, { walletError });
}
