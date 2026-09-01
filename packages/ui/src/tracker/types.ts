import {
    ConnectionEvent,
    ConnectionRestoringEvent,
    DisconnectionEvent,
    DataSigningEvent,
    TransactionSigningEvent,
    VersionEvent,
    WalletModalOpenedEvent,
    SelectedWalletEvent,
    WalletPreselectedEvent,
    WalletSelectedEvent
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
    | SelectedWalletEvent
    | WalletPreselectedEvent
    | WalletSelectedEvent;

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
    createSelectedWalletEvent,
    createWalletPreselectedEvent,
    createWalletSelectedEvent
} from '@tonconnect/sdk';
