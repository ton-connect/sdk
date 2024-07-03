import {
    ConnectionEvent,
    ConnectionRestoringEvent,
    DisconnectionEvent,
    TransactionSigningEvent,
    VersionEvent,
    EncryptDataEvent,
    DecryptDataEvent,
} from '@tonconnect/sdk';

/**
 * User action events.
 */
export type UserActionEvent =
    | VersionEvent
    | ConnectionEvent
    | ConnectionRestoringEvent
    | DisconnectionEvent
    | TransactionSigningEvent
    | EncryptDataEvent
    | DecryptDataEvent;

export {
    createRequestVersionEvent,
    createResponseVersionEvent,
    createConnectionStartedEvent,
    createConnectionErrorEvent,
    createConnectionCompletedEvent,
    createConnectionRestoringStartedEvent,
    createConnectionRestoringErrorEvent,
    createConnectionRestoringCompletedEvent,
    createDisconnectionEvent,
    createTransactionSentForSignatureEvent,
    createTransactionSigningFailedEvent,
    createTransactionSignedEvent,
    createDecryptDataEvent,
    createEncryptDataEvent,
    createEncryptDataFailedEvent,
    createEncryptDataSentEvent,
    createDecryptDataSentEvent,
    createDecryptDataFailedEvent,
} from '@tonconnect/sdk';

export interface DecryptData {
    senderAddress: string;
    data: string;
    };