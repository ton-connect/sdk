import {
    CONNECT_EVENT_ERROR_CODES,
    ConnectItem,
    SEND_TRANSACTION_ERROR_CODES,
    SIGN_DATA_ERROR_CODES,
    SignDataPayload
} from '@tonconnect/protocol';
import {
    SendTransactionRequest,
    SendTransactionResponse,
    SignDataResponse,
    Wallet
} from 'src/models';
import { isTelegramUrl } from 'src/utils/url';

/**
 * Request TON Connect UI version.
 */
export type RequestVersionEvent = {
    /**
     * Event type.
     */
    type: 'request-version';
};

/**
 * Create a request version event.
 */
export function createRequestVersionEvent(): RequestVersionEvent {
    return {
        type: 'request-version'
    };
}

/**
 * Response TON Connect UI version.
 */
export type ResponseVersionEvent = {
    /**
     * Event type.
     */
    type: 'response-version';
    /**
     * TON Connect UI version.
     */
    version: string;
};

/**
 * Create a response version event.
 * @param version
 */
export function createResponseVersionEvent(version: string): ResponseVersionEvent {
    return {
        type: 'response-version',
        version: version
    };
}

/**
 * Version events.
 */
export type VersionEvent = RequestVersionEvent | ResponseVersionEvent;

/**
 * Version of the TON Connect SDK and TON Connect UI.
 */
export type Version = {
    /**
     * TON Connect SDK version.
     */
    ton_connect_sdk_lib: string | null;
    /**
     * TON Connect UI version.
     */
    ton_connect_ui_lib: string | null;
};

export type SessionInfo = {
    clientId: string | null;
    walletId: string | null;
};

/**
 * Create a version info.
 * @param version
 */
export function createVersionInfo(version: Version): Version {
    return {
        ton_connect_sdk_lib: version.ton_connect_sdk_lib,
        ton_connect_ui_lib: version.ton_connect_ui_lib
    };
}

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
     * Connected wallet state init.
     */
    wallet_state_init: string | null;
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

        client_id: string | null;
        wallet_id: string | null;
    } & Version;
};

// eslint-disable-next-line complexity
function createConnectionInfo(
    version: Version,
    wallet: Wallet | null,
    sessionInfo?: SessionInfo | null
): ConnectionInfo {
    const isTonProof = wallet?.connectItems?.tonProof && 'proof' in wallet.connectItems.tonProof;
    const authType: AuthType = isTonProof ? 'ton_proof' : 'ton_addr';

    return {
        wallet_address: wallet?.account?.address ?? null,
        wallet_state_init: wallet?.account.walletStateInit ?? null,
        wallet_type: wallet?.device.appName ?? null,
        wallet_version: wallet?.device.appVersion ?? null,
        auth_type: authType,
        custom_data: {
            client_id: sessionInfo?.clientId ?? null,
            wallet_id: sessionInfo?.walletId ?? null,
            chain_id: wallet?.account?.chain ?? null,
            provider: wallet?.provider ?? null,
            ...createVersionInfo(version)
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
    /**
     * Custom data for the connection.
     */
    custom_data: Version;
    /**
     * Unique identifier used for tracking a specific user flow.
     */
    trace_id?: string | null;
};

/**
 * Create a connection init event.
 */
export function createConnectionStartedEvent(
    version: Version,
    traceId?: string | null
): ConnectionStartedEvent {
    return {
        type: 'connection-started',
        custom_data: createVersionInfo(version),
        trace_id: traceId ?? null
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
     * Connection success flag.
     */
    is_success: true;
    /**
     * Unique identifier used for tracking a specific user flow.
     */
    trace_id?: string | null;
} & ConnectionInfo;

/**
 * Create a connection completed event.
 * @param version
 * @param wallet
 * @param sessionInfo
 * @param traceId
 */
export function createConnectionCompletedEvent(
    version: Version,
    wallet: Wallet | null,
    sessionInfo?: SessionInfo | null,
    traceId?: string | null
): ConnectionCompletedEvent {
    return {
        type: 'connection-completed',
        is_success: true,
        trace_id: traceId ?? null,
        ...createConnectionInfo(version, wallet, sessionInfo)
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
     * Connection success flag.
     */
    is_success: false;
    /**
     * Reason for the error.
     */
    error_message: string;
    /**
     * Error code.
     */
    error_code: CONNECT_EVENT_ERROR_CODES | null;
    /**
     * Custom data for the connection.
     */
    custom_data: {
        client_id: string | null;
        wallet_id: string | null;
    } & Version;
    /**
     * Unique identifier used for tracking a specific user flow.
     */
    trace_id?: string | null;
};

/**
 * Create a connection error event.
 * @param version
 * @param error_message
 * @param errorCode
 * @param sessionInfo
 * @param traceId
 */
export function createConnectionErrorEvent(
    version: Version,
    error_message: string,
    errorCode: CONNECT_EVENT_ERROR_CODES | void,
    sessionInfo?: SessionInfo | null,
    traceId?: string | null
): ConnectionErrorEvent {
    return {
        type: 'connection-error',
        is_success: false,
        error_message: error_message,
        error_code: errorCode ?? null,
        trace_id: traceId ?? null,
        custom_data: {
            client_id: sessionInfo?.clientId ?? null,
            wallet_id: sessionInfo?.walletId ?? null,
            ...createVersionInfo(version)
        }
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
    /**
     * Custom data for the connection.
     */
    custom_data: Version;
    /**
     * Unique identifier used for tracking a specific user flow.
     */
    trace_id?: string | null;
};

/**
 * Create a connection restoring started event.
 */
export function createConnectionRestoringStartedEvent(
    version: Version,
    traceId?: string | null
): ConnectionRestoringStartedEvent {
    return {
        type: 'connection-restoring-started',
        custom_data: createVersionInfo(version),
        trace_id: traceId ?? null
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
     * Connection success flag.
     */
    is_success: true;
    /**
     * Unique identifier used for tracking a specific user flow.
     */
    trace_id?: string | null;
} & ConnectionInfo;

/**
 * Create a connection restoring completed event.
 * @param version
 * @param wallet
 * @param sessionInfo
 * @param traceId
 */
export function createConnectionRestoringCompletedEvent(
    version: Version,
    wallet: Wallet | null,
    sessionInfo?: SessionInfo | null,
    traceId?: string | null
): ConnectionRestoringCompletedEvent {
    return {
        type: 'connection-restoring-completed',
        is_success: true,
        trace_id: traceId ?? null,
        ...createConnectionInfo(version, wallet, sessionInfo)
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
     * Connection success flag.
     */
    is_success: false;
    /**
     * Reason for the error.
     */
    error_message: string;
    /**
     * Custom data for the connection.
     */
    custom_data: Version;
    /**
     * Unique identifier used for tracking a specific user flow.
     */
    trace_id?: string | null;
};

/**
 * Create a connection restoring error event.
 * @param version
 * @param errorMessage
 * @param traceId
 */
export function createConnectionRestoringErrorEvent(
    version: Version,
    errorMessage: string,
    traceId?: string | null
): ConnectionRestoringErrorEvent {
    return {
        type: 'connection-restoring-error',
        is_success: false,
        error_message: errorMessage,
        trace_id: traceId ?? null,
        custom_data: createVersionInfo(version)
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
 * Transaction message.
 */
export type TransactionFullMessage = {
    /**
     * Recipient address.
     */
    address: string | null;
    /**
     * Transfer amount.
     */
    amount: string | null;

    /**
     * Message payload
     */
    payload: string | null;

    /**
     * Message state init
     */
    state_init: string | null;
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

/**
 * Transaction information.
 */
export type TransactionFullInfo = Omit<TransactionInfo, 'messages'> & {
    messages: TransactionFullMessage[];
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

function createTransactionFullInfo(
    wallet: Wallet | null,
    transaction: SendTransactionRequest
): TransactionFullInfo {
    return {
        valid_until: String(transaction.validUntil) ?? null,
        from: transaction.from ?? wallet?.account?.address ?? null,
        messages: transaction.messages.map(message => ({
            address: message.address ?? null,
            amount: message.amount ?? null,
            payload: message.payload ?? null,
            state_init: message.stateInit ?? null
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
     * Unique identifier used for tracking a specific user flow.
     */
    trace_id?: string | null;
} & ConnectionInfo &
    TransactionInfo;

/**
 * Create a transaction init event.
 * @param version
 * @param wallet
 * @param transaction
 * @param sessionInfo
 * @param traceId
 */
export function createTransactionSentForSignatureEvent(
    version: Version,
    wallet: Wallet | null,
    transaction: SendTransactionRequest,
    sessionInfo?: SessionInfo | null,
    traceId?: string | null
): TransactionSentForSignatureEvent {
    return {
        type: 'transaction-sent-for-signature',
        trace_id: traceId ?? null,
        ...createConnectionInfo(version, wallet, sessionInfo),
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
     * Connection success flag.
     */
    is_success: true;
    /**
     * Signed transaction.
     */
    signed_transaction: string;
    /**
     * Unique identifier used for tracking a specific user flow.
     */
    trace_id?: string | null;
} & ConnectionInfo &
    TransactionInfo;

/**
 * Create a transaction signed event.
 * @param version
 * @param wallet
 * @param transaction
 * @param signedTransaction
 * @param sessionInfo
 * @param traceId
 */
export function createTransactionSignedEvent(
    version: Version,
    wallet: Wallet | null,
    transaction: SendTransactionRequest,
    signedTransaction: SendTransactionResponse,
    sessionInfo?: SessionInfo | null,
    traceId?: string | null
): TransactionSignedEvent {
    return {
        type: 'transaction-signed',
        is_success: true,
        signed_transaction: signedTransaction.boc,
        trace_id: traceId ?? null,
        ...createConnectionInfo(version, wallet, sessionInfo),
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
     * Connection success flag.
     */
    is_success: false;
    /**
     * Reason for the error.
     */
    error_message: string;
    /**
     * Error code.
     */
    error_code: SEND_TRANSACTION_ERROR_CODES | null;
    /**
     * Unique identifier used for tracking a specific user flow.
     */
    trace_id?: string | null;
} & ConnectionInfo &
    TransactionFullInfo;

/**
 * Create a transaction error event.
 * @param version
 * @param wallet
 * @param transaction
 * @param errorMessage
 * @param errorCode
 * @param sessionInfo
 * @param traceId
 */
export function createTransactionSigningFailedEvent(
    version: Version,
    wallet: Wallet | null,
    transaction: SendTransactionRequest,
    errorMessage: string,
    errorCode: SEND_TRANSACTION_ERROR_CODES | void,
    sessionInfo?: SessionInfo | null,
    traceId?: string | null
): TransactionSigningFailedEvent {
    return {
        type: 'transaction-signing-failed',
        is_success: false,
        error_message: errorMessage,
        error_code: errorCode ?? null,
        trace_id: traceId ?? null,
        ...createConnectionInfo(version, wallet, sessionInfo),
        ...createTransactionFullInfo(wallet, transaction)
    };
}

/**
 * Transaction events.
 */
export type TransactionSigningEvent =
    | TransactionSentForSignatureEvent
    | TransactionSignedEvent
    | TransactionSigningFailedEvent;

export type DataSentForSignatureEvent = {
    type: 'sign-data-request-initiated';
    data: SignDataPayload;
    /**
     * Unique identifier used for tracking a specific user flow.
     */
    trace_id?: string | null;
} & ConnectionInfo;

export function createDataSentForSignatureEvent(
    version: Version,
    wallet: Wallet | null,
    data: SignDataPayload,
    sessionInfo?: SessionInfo | null,
    traceId?: string | null
): DataSentForSignatureEvent {
    return {
        type: 'sign-data-request-initiated',
        data,
        trace_id: traceId ?? null,
        ...createConnectionInfo(version, wallet, sessionInfo)
    };
}

export type DataSignedEvent = {
    type: 'sign-data-request-completed';
    is_success: true;
    data: SignDataPayload;
    signed_data: SignDataResponse;
    /**
     * Unique identifier used for tracking a specific user flow.
     */
    trace_id?: string | null;
} & ConnectionInfo;

export function createDataSignedEvent(
    version: Version,
    wallet: Wallet | null,
    data: SignDataPayload,
    signedData: SignDataResponse,
    sessionInfo?: SessionInfo | null,
    traceId?: string | null
): DataSignedEvent {
    return {
        type: 'sign-data-request-completed',
        is_success: true,
        data,
        signed_data: signedData,
        trace_id: traceId ?? null,
        ...createConnectionInfo(version, wallet, sessionInfo)
    };
}

export type DataSigningFailedEvent = {
    type: 'sign-data-request-failed';
    is_success: false;
    error_message: string;
    error_code: SIGN_DATA_ERROR_CODES | null;
    data: SignDataPayload;
    /**
     * Unique identifier used for tracking a specific user flow.
     */
    trace_id?: string | null;
} & ConnectionInfo;

export function createDataSigningFailedEvent(
    version: Version,
    wallet: Wallet | null,
    data: SignDataPayload,
    errorMessage: string,
    errorCode: SIGN_DATA_ERROR_CODES | void,
    sessionInfo?: SessionInfo | null,
    traceId?: string | null
): DataSigningFailedEvent {
    return {
        type: 'sign-data-request-failed',
        is_success: false,
        data,
        error_message: errorMessage,
        error_code: errorCode ?? null,
        trace_id: traceId ?? null,
        ...createConnectionInfo(version, wallet, sessionInfo)
    };
}

export type DataSigningEvent = DataSentForSignatureEvent | DataSignedEvent | DataSigningFailedEvent;

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
    /**
     * Unique identifier used for tracking a specific user flow.
     */
    trace_id?: string | null;
} & ConnectionInfo;

export function createDisconnectionEvent(
    version: Version,
    wallet: Wallet | null,
    scope: 'dapp' | 'wallet',
    sessionInfo?: SessionInfo | null,
    traceId?: string | null
): DisconnectionEvent {
    return {
        type: 'disconnection',
        scope: scope,
        trace_id: traceId ?? null,
        ...createConnectionInfo(version, wallet, sessionInfo)
    };
}

/**
 * Represents the event triggered when the wallet modal is opened.
 */
export type WalletModalOpenedEvent = {
    /**
     * Event type.
     */
    type: 'wallet-modal-opened';

    /**
     * The unique client identifier associated with the session or user.
     */
    client_id: string | null;

    /**
     * A list of wallet identifiers that are currently visible in the modal.
     */
    visible_wallets: string[];

    /**
     * Custom metadata containing versioning or contextual data for the modal.
     */
    custom_data: Version;

    /**
     * Unique identifier used for tracking a specific user flow.
     */
    trace_id: string | null;
};

export function createWalletModalOpenedEvent(
    version: Version,
    visibleWallets: string[],
    clientId?: string | null,
    traceId?: string | null
): WalletModalOpenedEvent {
    return {
        type: 'wallet-modal-opened',
        visible_wallets: visibleWallets,
        client_id: clientId ?? null,
        custom_data: version,
        trace_id: traceId ?? null
    };
}

/**
 * Represents the event triggered when the wallet is selected.
 */
export type SelectedWalletEvent = {
    /**
     * Event type.
     */
    type: 'selected-wallet';

    /**
     * The unique client identifier associated with the session or user.
     */
    client_id: string | null;

    /**
     * A list of wallet identifiers that are currently visible in the modal.
     */
    visible_wallets: string[];
    wallets_menu: 'explicit_wallet' | 'main_screen' | 'other_wallets';

    /**
     * Redirect method: tg_link, external_link
     */
    wallet_redirect_method?: 'tg_link' | 'external_link';

    /**
     * URL used to open the wallet
     */
    wallet_redirect_link?: string;

    /**
     * Wallet type: 'tonkeeper', 'tonhub', etc.
     */
    wallet_type: string | null;

    /**
     * Custom metadata containing versioning or contextual data for the modal.
     */
    custom_data: Version;

    /**
     * Unique identifier used for tracking a specific user flow.
     */
    trace_id: string | null;
};

export function createSelectedWalletEvent(
    version: Version,
    visibleWallets: string[],
    lastSelectedWallet: { appName?: string } | null,
    walletsMenu: 'explicit_wallet' | 'main_screen' | 'other_wallets',
    redirectLink: string,
    redirectLinkType?: 'tg_link' | 'external_link',
    clientId?: string | null,
    traceId?: string | null
): SelectedWalletEvent {
    let walletRedirectMethod = redirectLinkType;
    if (!walletRedirectMethod && redirectLink) {
        walletRedirectMethod = isTelegramUrl(redirectLink) ? 'tg_link' : 'external_link';
    }
    return {
        type: 'selected-wallet',
        wallets_menu: walletsMenu,
        visible_wallets: visibleWallets,
        client_id: clientId ?? null,
        custom_data: version,
        trace_id: traceId ?? null,
        wallet_redirect_method: walletRedirectMethod,
        wallet_redirect_link: redirectLink || undefined,
        wallet_type: lastSelectedWallet?.appName ?? null
    };
}

/**
 * User action events.
 */
export type SdkActionEvent =
    | VersionEvent
    | ConnectionEvent
    | ConnectionRestoringEvent
    | DisconnectionEvent
    | TransactionSigningEvent
    | DataSigningEvent
    | WalletModalOpenedEvent
    | SelectedWalletEvent;

/**
 * Parameters without version field.
 */
export type WithoutVersion<T> = T extends [Version, ...infer Rest] ? [...Rest] : never;
