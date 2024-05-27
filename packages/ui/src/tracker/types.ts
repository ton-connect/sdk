import {
    ConnectionEvent,
    ConnectionRestoringEvent,
    DisconnectionEvent,
    TransactionSigningEvent,
    VersionEvent
} from '@tonconnect/sdk';

/**
 * User action events.
 */
export type UserActionEvent =
    | VersionEvent
    | ConnectionEvent
    | ConnectionRestoringEvent
    | DisconnectionEvent
    | TransactionSigningEvent;

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
    createTransactionSignedEvent
} from '@tonconnect/sdk';
