import { CONNECT_EVENT_ERROR_CODES, ConnectItem, SEND_TRANSACTION_ERROR_CODES } from '@tonconnect/protocol';
import { SendTransactionRequest, SendTransactionResponse, Wallet } from 'src/models';

/**
 * Requested authentication type: 'ton_addr' or 'ton_proof'.
 */
export type AuthType = ConnectItem['name'];

/**
 * Information about a connected wallet.
 */
export type ConnectionInfo = {
    /**
     * Connected wallet address.
     */
    wallet_address: string | null;
    /**
     * Wallet type: 'tonkeeper', 'tonhub', etc.
     */
    wallet_type: string | null;
    /**
     * Wallet version.
     */
    wallet_version: string | null;
    /**
     * Requested authentication types.
     */
    auth_type: AuthType;
    /**
     * Custom data for the connection.
     */
    custom_data: {
        /**
         * Connected chain ID.
         */
        chain_id: string | null;
        /**
         * Wallet provider.
         */
        provider: 'http' | 'injected' | null;
    };
};

function createConnectionInfo(wallet: Wallet | null): ConnectionInfo {
    const isTonProof = wallet?.connectItems?.tonProof && 'proof' in wallet.connectItems.tonProof;
    const authType: AuthType = isTonProof ? 'ton_proof' : 'ton_addr';

    return {
        wallet_address: wallet?.account?.address ?? null,
        wallet_type: wallet?.device.appName ?? null,
        wallet_version: wallet?.device.appVersion ?? null,
        auth_type: authType,
        custom_data: {
            chain_id: wallet?.account?.chain ?? null,
            provider: wallet?.provider ?? null
        }
    };
}

/**
 * Initial connection event when a user initiates a connection.
 */
export type ConnectionStartedEvent = {
    /**
     * Event type.
     */
    type: 'connection-started';
};

/**
 * Create a connection init event.
 */
export function createConnectionStartedEvent(): ConnectionStartedEvent {
    return {
        type: 'connection-started'
    };
}

/**
 * Successful connection event when a user successfully connected a wallet.
 */
export type ConnectionCompletedEvent = {
    /**
     * Event type.
     */
    type: 'connection-completed';
} & ConnectionInfo;

/**
 * Create a connection completed event.
 * @param wallet
 */
export function createConnectionCompletedEvent(wallet: Wallet | null): ConnectionCompletedEvent {
    return {
        type: 'connection-completed',
        ...createConnectionInfo(wallet)
    };
}

/**
 * Connection error event when a user cancels a connection or there is an error during the connection process.
 */
export type ConnectionErrorEvent = {
    /**
     * Event type.
     */
    type: 'connection-error';
    /**
     * Reason for the error.
     */
    error_message: string;
    /**
     * Error code.
     */
    error_code: CONNECT_EVENT_ERROR_CODES | null;
};

/**
 * Create a connection error event.
 * @param error_message
 * @param errorCode
 */
export function createConnectionErrorEvent(
    error_message: string,
    errorCode: CONNECT_EVENT_ERROR_CODES | void
): ConnectionErrorEvent {
    return {
        type: 'connection-error',
        error_message: error_message,
        error_code: errorCode ?? null
    };
}

/**
 * Connection events.
 */
export type ConnectionEvent =
    | ConnectionStartedEvent
    | ConnectionCompletedEvent
    | ConnectionErrorEvent;

/**
 * Connection restoring started event when initiates a connection restoring process.
 */
export type ConnectionRestoringStartedEvent = {
    /**
     * Event type.
     */
    type: 'connection-restoring-started';
};

/**
 * Create a connection restoring started event.
 */
export function createConnectionRestoringStartedEvent(): ConnectionRestoringStartedEvent {
    return {
        type: 'connection-restoring-started'
    };
}

/**
 * Connection restoring completed event when successfully restored a connection.
 */
export type ConnectionRestoringCompletedEvent = {
    /**
     * Event type.
     */
    type: 'connection-restoring-completed';
} & ConnectionInfo;

/**
 * Create a connection restoring completed event.
 * @param wallet
 */
export function createConnectionRestoringCompletedEvent(
    wallet: Wallet | null
): ConnectionRestoringCompletedEvent {
    return {
        type: 'connection-restoring-completed',
        ...createConnectionInfo(wallet)
    };
}

/**
 * Connection restoring error event when there is an error during the connection restoring process.
 */
export type ConnectionRestoringErrorEvent = {
    /**
     * Event type.
     */
    type: 'connection-restoring-error';
    /**
     * Reason for the error.
     */
    error_message: string;
};

/**
 * Create a connection restoring error event.
 * @param errorMessage
 */
export function createConnectionRestoringErrorEvent(
    errorMessage: string
): ConnectionRestoringErrorEvent {
    return {
        type: 'connection-restoring-error',
        error_message: errorMessage
    };
}

/**
 * Connection restoring events.
 */
export type ConnectionRestoringEvent =
    | ConnectionRestoringStartedEvent
    | ConnectionRestoringCompletedEvent
    | ConnectionRestoringErrorEvent;

/**
 * Transaction message.
 */
export type TransactionMessage = {
    /**
     * Recipient address.
     */
    address: string | null;
    /**
     * Transfer amount.
     */
    amount: string | null;
};

/**
 * Transaction information.
 */
export type TransactionInfo = {
    /**
     * Transaction validity time in unix timestamp.
     */
    valid_until: string | null;
    /**
     * Sender address.
     */
    from: string | null;
    /**
     * Transaction messages.
     */
    messages: TransactionMessage[];
};

function createTransactionInfo(
    wallet: Wallet | null,
    transaction: SendTransactionRequest
): TransactionInfo {
    return {
        valid_until: String(transaction.validUntil) ?? null,
        from: transaction.from ?? wallet?.account?.address ?? null,
        messages: transaction.messages.map(message => ({
            address: message.address ?? null,
            amount: message.amount ?? null
        }))
    };
}

/**
 * Initial transaction event when a user initiates a transaction.
 */
export type TransactionSentForSignatureEvent = {
    /**
     * Event type.
     */
    type: 'transaction-sent-for-signature';
} & ConnectionInfo &
    TransactionInfo;

/**
 * Create a transaction init event.
 * @param wallet
 * @param transaction
 */
export function createTransactionSentForSignatureEvent(
    wallet: Wallet | null,
    transaction: SendTransactionRequest
): TransactionSentForSignatureEvent {
    return {
        type: 'transaction-sent-for-signature',
        ...createConnectionInfo(wallet),
        ...createTransactionInfo(wallet, transaction)
    };
}

/**
 * Transaction signed event when a user successfully signed a transaction.
 */
export type TransactionSignedEvent = {
    /**
     * Event type.
     */
    type: 'transaction-signed';
    /**
     * Signed transaction.
     */
    signed_transaction: string;
} & ConnectionInfo &
    TransactionInfo;

/**
 * Create a transaction signed event.
 * @param wallet
 * @param transaction
 * @param signedTransaction
 */
export function createTransactionSignedEvent(
    wallet: Wallet | null,
    transaction: SendTransactionRequest,
    signedTransaction: SendTransactionResponse
): TransactionSignedEvent {
    return {
        type: 'transaction-signed',
        signed_transaction: signedTransaction.boc,
        ...createConnectionInfo(wallet),
        ...createTransactionInfo(wallet, transaction)
    };
}

/**
 * Transaction error event when a user cancels a transaction or there is an error during the transaction process.
 */
export type TransactionSigningFailedEvent = {
    /**
     * Event type.
     */
    type: 'transaction-signing-failed';
    /**
     * Reason for the error.
     */
    error_message: string;
    /**
     * Error code.
     */
    error_code: SEND_TRANSACTION_ERROR_CODES | null;
} & ConnectionInfo &
    TransactionInfo;

/**
 * Create a transaction error event.
 * @param wallet
 * @param transaction
 * @param errorMessage
 * @param errorCode
 */
export function createTransactionSigningFailedEvent(
    wallet: Wallet | null,
    transaction: SendTransactionRequest,
    errorMessage: string,
    errorCode: SEND_TRANSACTION_ERROR_CODES | void
): TransactionSigningFailedEvent {
    return {
        type: 'transaction-signing-failed',
        error_message: errorMessage,
        error_code: errorCode ?? null,
        ...createConnectionInfo(wallet),
        ...createTransactionInfo(wallet, transaction)
    };
}

/**
 * Transaction events.
 */
export type TransactionSigningEvent =
    | TransactionSentForSignatureEvent
    | TransactionSignedEvent
    | TransactionSigningFailedEvent;

/**
 * Disconnect event when a user initiates a disconnection.
 */
export type DisconnectionEvent = {
    /**
     * Event type.
     */
    type: 'disconnection';
    /**
     * Disconnect scope: 'dapp' or 'wallet'.
     */
    scope: 'dapp' | 'wallet';
} & ConnectionInfo;

/**
 * Create a disconnect event.
 * @param wallet
 * @param scope
 * @returns
 */
export function createDisconnectionEvent(
    wallet: Wallet | null,
    scope: 'dapp' | 'wallet'
): DisconnectionEvent {
    return {
        type: 'disconnection',
        scope: scope,
        ...createConnectionInfo(wallet)
    };
}

/**
 * User action events.
 */
export type SdkActionEvent =
    | ConnectionEvent
    | ConnectionRestoringEvent
    | DisconnectionEvent
    | TransactionSigningEvent;
