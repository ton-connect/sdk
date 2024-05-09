import { ConnectItem } from '@tonconnect/protocol';
import { SendTransactionRequest, SendTransactionResponse, Wallet } from '@tonconnect/sdk';

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
    address: string | null;
    /**
     * Connected chain ID.
     */
    chainId: string | null;
    /**
     * Wallet provider.
     */
    provider: 'http' | 'injected' | null;
    /**
     * Wallet type: 'tonkeeper', 'tonhub', etc.
     */
    walletType: string | null;
    /**
     * Wallet version.
     */
    walletVersion: string | null;
    /**
     * Requested authentication types.
     */
    authType: AuthType | null;
};

function createConnnectionInfo(wallet: Wallet | null): ConnectionInfo {
    let authType: AuthType | null = null;
    if (wallet?.connectItems?.tonProof) {
        authType = 'proof' in wallet.connectItems.tonProof ? 'ton_proof' : null;
    } else if (wallet?.connectItems) {
        authType = 'ton_addr';
    }

    return {
        address: wallet?.account?.address ?? null,
        chainId: wallet?.account?.chain ?? null,
        provider: wallet?.provider ?? null,
        walletType: wallet?.device.appName ?? null,
        walletVersion: wallet?.device.appVersion ?? null,
        authType: authType
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
    /**
     * Wallet information.
     */
    connectionInfo: ConnectionInfo;
};

/**
 * Create a connection completed event.
 * @param wallet
 */
export function createConnectionCompletedEvent(wallet: Wallet | null): ConnectionCompletedEvent {
    return {
        type: 'connection-completed',
        connectionInfo: createConnnectionInfo(wallet)
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
    reason: string;
};

/**
 * Create a connection error event.
 * @param reason
 */
export function createConnectionErrorEvent(reason: string): ConnectionErrorEvent {
    return {
        type: 'connection-error',
        reason
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
    /**
     * Wallet information.
     */
    connectionInfo: ConnectionInfo;
};

/**
 * Create a connection restoring completed event.
 * @param wallet
 */
export function createConnectionRestoringCompletedEvent(
    wallet: Wallet | null
): ConnectionRestoringCompletedEvent {
    return {
        type: 'connection-restoring-completed',
        connectionInfo: createConnnectionInfo(wallet)
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
    reason: string;
};

/**
 * Create a connection restoring error event.
 * @param reason
 */
export function createConnectionRestoringErrorEvent(reason: string): ConnectionRestoringErrorEvent {
    return {
        type: 'connection-restoring-error',
        reason
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
    validUntil: number | null;
    /**
     * Sender address.
     */
    from: string | null;
    /**
     * Transaction messages.
     */
    messages: TransactionMessage[];
};

function createTransactionInfo(transaction: SendTransactionRequest): TransactionInfo {
    return {
        validUntil: transaction.validUntil ?? null,
        from: transaction.from ?? null,
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
    /**
     * Wallet information.
     */
    connectionInfo: ConnectionInfo;
    /**
     * Transaction information.
     */
    transactionInfo: TransactionInfo;
};

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
        connectionInfo: createConnnectionInfo(wallet),
        transactionInfo: createTransactionInfo(transaction)
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
     * Wallet information.
     */
    connectionInfo: ConnectionInfo;
    /**
     * Transaction information.
     */
    transactionInfo: TransactionInfo;
    /**
     * Signed transaction.
     */
    signedTransaction: string;
};

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
        connectionInfo: createConnnectionInfo(wallet),
        transactionInfo: createTransactionInfo(transaction),
        signedTransaction: signedTransaction.boc
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
     * Wallet information.
     */
    connectionInfo: ConnectionInfo;
    /**
     * Transaction information.
     */
    transactionInfo: TransactionInfo;
    /**
     * Reason for the error.
     */
    reason: string;
};

/**
 * Create a transaction error event.
 * @param wallet
 * @param transaction
 * @param reason
 */
export function createTransactionSigningFailedEvent(
    wallet: Wallet | null,
    transaction: SendTransactionRequest,
    reason: string
): TransactionSigningFailedEvent {
    return {
        type: 'transaction-signing-failed',
        connectionInfo: createConnnectionInfo(wallet),
        transactionInfo: createTransactionInfo(transaction),
        reason
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
     * Wallet information.
     */
    connectionInfo: ConnectionInfo;
    /**
     * Disconnect scope: 'dapp' or 'wallet'.
     */
    scope: 'dapp' | 'wallet';
};

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
        connectionInfo: createConnnectionInfo(wallet),
        scope: scope
    };
}

/**
 * User action events.
 */
export type UserActionEvent =
    | ConnectionEvent
    | ConnectionRestoringEvent
    | DisconnectionEvent
    | TransactionSigningEvent;
