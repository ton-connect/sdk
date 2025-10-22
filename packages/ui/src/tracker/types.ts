import {
    ConnectionEvent,
    ConnectionRestoringEvent,
    DisconnectionEvent,
    DataSigningEvent,
    TransactionSigningEvent,
    VersionEvent,
    WalletModalOpenedEvent,
    SelectedWalletEvent
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
    | DataSigningEvent
    | WalletModalOpenedEvent
    | SelectedWalletEvent;

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
    createWalletModalOpenedEvent,
    createSelectedWalletEvent
} from '@tonconnect/sdk';
