import {
    ConnectionEvent,
    ConnectionRestoringEvent,
    DisconnectionEvent,
    TransactionSigningEvent
} from '@tonconnect/sdk';

/**
 * User action events.
 */
export type UserActionEvent =
    | ConnectionEvent
    | ConnectionRestoringEvent
    | DisconnectionEvent
    | TransactionSigningEvent;

export {
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
