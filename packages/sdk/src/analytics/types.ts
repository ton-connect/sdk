export type BaseEvent = {
    event_id?: string;
    /**
     * ID to aggregate multiple events into one trace. UUIDv7 must be used (first 48 bits must be unix_ts_ms as in the specification). trace_id older than 24h won't be accepted.
     */
    trace_id?: string;
    /**
     * The subsystem used to collect the event (possible values: dapp, dapp-sdk, bridge, wallet, wallet-sdk).
     */
    subsystem?: 'dapp' | 'dapp-sdk' | 'bridge' | 'wallet' | 'wallet-sdk';
    /**
     * The client environment.
     */
    client_environment?: string;
    /**
     * The timestamp of the event on the client side, in Unix time (stored as an integer).
     */
    client_timestamp?: number;
    /**
     * The version of the sending subsystem.
     */
    version?: string;
    versions?: {
        [key: string]: string;
    };
    /**
     * Network id (-239 for the mainnet and -3 for the testnet). Other values should be rejected.
     */
    network_id?: string;
    /**
     * The type of network connection being used (e.g., wifi, 4g, 3g, etc.)
     */
    conn_network_type?: string;
    /**
     * Estimated effective round-trip time across recently active connections in milliseconds.
     */
    conn_rtt?: number;
    /**
     * Estimated effective time across recently active connections to first byte in milliseconds.
     */
    conn_ttfb?: number;
    /**
     * Duration of wallet list download in milliseconds.
     */
    wallet_list_download_duration?: number;
};

export type WalletInfo = {
    wallet_address: string;
    wallet_state_init: string;
    wallet_app_name: string;
    wallet_app_version: string;
};

export type SessionInfo = {
    /**
     * A unique session ID should be generated every time the user initiated "Connect wallet" action
     */
    client_id: string;
    /**
     * Unique session ID on the wallet side
     */
    wallet_id: string;
};

export type TonConnectBaseEvent = BaseEvent & {
    /**
     * URL of the current page (excluding query and hash part of the URL).
     */
    origin_url?: string;
    tg_id?: number;
    /**
     * Whether the user has Telegram Premium.
     */
    tma_is_premium?: boolean;
    /**
     * User locale.
     */
    locale?: string;
    /**
     * Browser name: TB (Telegram browser), TMA (Telegram mini-app), BIW (Browser in wallet), Chrome, Mozilla,... The values are based on the TON Connect categories.
     */
    browser?: string;
    /**
     * TON Connect manifest URL.
     */
    manifest_json_url?: string;
    /**
     * OS and platform name based on the TON Connect categories. If it is impossible to determine a platform the unknown value should be used.
     */
    platform?: string;
};

export type ConnectionStartedEvent = TonConnectBaseEvent &
    Pick<SessionInfo, 'client_id'> & {
        event_name: 'connection-started';
        /**
         * List of the wallets on the main screen.
         */
        main_screen: Array<string>;
    };

/**
 * A connection was initiated against a particular kind of source.
 *
 * Emitted by the core SDK on every `connect()`, so unlike `connection-selected-wallet` it is
 * also present for dApps that do not use `@tonconnect/ui`. Counts initiations rather than user
 * actions — one journey can produce several rows on a single `trace_id`.
 *
 * `client_environment` is empty for dApps that do not supply an environment (i.e. those not
 * using `@tonconnect/ui`); read it as unknown rather than as web.
 */
export type ConnectionInitiatedEvent = TonConnectBaseEvent & {
    event_name: 'connection-initiated';
    /**
     * One of js-embedded, js-injected, http-specific-wallet, http-any-wallet, wallet-connect.
     * Prefixed by transport, so `js-%` and `http-%` recover that axis without an IN-list.
     */
    connection_source_kind: string;
    /**
     * Injected bridge key, for js-embedded and js-injected sources.
     */
    bridge_key?: string;
    /**
     * Bridge URL, for an http-specific-wallet source.
     */
    bridge_url?: string;
};

export type ConnectionSelectedWallet = TonConnectBaseEvent &
    Pick<SessionInfo, 'client_id'> & {
        event_name: 'connection-selected-wallet';
        /**
         * One of explicit_wallet, main_screen, other_wallets
         */
        wallets_menu: 'explicit_wallet' | 'main_screen' | 'other_wallets';
        /**
         * List of the wallets on the main screen.
         */
        main_screen: Array<string>;
        wallet_app_name: string;
        wallet_redirect_method?: 'tg_link' | 'external_link';
        wallet_redirect_link?: string;
    };

/**
 * A wallet was picked, but nothing is committed yet — desktop only in practice, where picking a
 * wallet opens a second screen offering QR, extension and desktop app. A preselection with no
 * matching wallet-selected on the same trace means the user scanned the default QR.
 */
export type WalletPreselectedEvent = TonConnectBaseEvent & {
    event_name: 'wallet-preselected';
    wallet_app_name: string;
    /**
     * One of universal-modal, all-wallets-list, connection-modal, single-wallet-modal, embedded.
     */
    surface: string;
    /**
     * One of manual, auto-embedded, auto-dapp-directed. `auto-%` matches every case where no
     * human clicked in the TON Connect UI.
     */
    selection_source: string;
};

/**
 * This wallet is the one being connected with. Replaces connection-selected-wallet: emitted from
 * the click handler with every field supplied by the call site, rather than reconstructed from
 * ambient UI state afterwards.
 */
export type WalletSelectedEvent = TonConnectBaseEvent & {
    event_name: 'wallet-selected';
    wallet_app_name: string;
    /**
     * One of universal-modal, all-wallets-list, connection-modal, single-wallet-modal, embedded.
     */
    surface: string;
    /**
     * One of manual, auto-embedded, auto-dapp-directed.
     */
    selection_source: string;
    /**
     * Transport picked on the desktop connection screen: mobile, desktop or extension. Present
     * only when surface is connection-modal.
     */
    connection_mode?: string;
};

/**
 * A connect link or QR was built for display, without anyone choosing to connect. Kept separate
 * from connection-initiated so that counting initiations does not count rendered screens: the
 * desktop universal modal builds a QR as it renders, and the desktop connection screen rebuilds
 * one in an effect, both opening real sessions nobody asked for.
 */
export type ConnectionLinkGeneratedEvent = TonConnectBaseEvent & {
    event_name: 'connection-link-generated';
    /**
     * One of js-embedded, js-injected, http-specific-wallet, http-any-wallet, wallet-connect.
     */
    connection_source_kind: string;
    bridge_key?: string;
    bridge_url?: string;
};

export type ConnectionCompletedEvent = TonConnectBaseEvent &
    WalletInfo &
    SessionInfo & {
        event_name: 'connection-completed';
        /**
         * True when this is a session restore replayed on page load rather than a new
         * connection. Exclude these before using completions as a connection count.
         */
        is_restore?: boolean;
        /**
         * Time spent to connect to the TON Connect bridge (milliseconds).
         */
        bridge_connect_duration?: number;
    };

export type ConnectionErrorEvent = TonConnectBaseEvent &
    SessionInfo & {
        event_name: 'connection-error';

        error_code: number;
        error_message: string;
    };

export type DisconnectionEvent = TonConnectBaseEvent &
    WalletInfo &
    SessionInfo & {
        event_name: 'disconnection';
    };

export type TransactionSentEvent = TonConnectBaseEvent &
    WalletInfo &
    SessionInfo & {
        event_name: 'transaction-sent';
    };

export type TransactionSignedEvent = TonConnectBaseEvent &
    WalletInfo &
    SessionInfo & {
        event_name: 'transaction-signed';

        /**
         * Bag of cells with a signed external message
         */
        signed_boc: string;
    };

export type TransactionSigningFailedEvent = TonConnectBaseEvent &
    WalletInfo &
    SessionInfo & {
        event_name: 'transaction-signing-failed';

        /**
         * Timestamp for transaction expiration
         */
        valid_until: number;
        messages: {
            /**
             * Address to send message to
             */
            address: string;
            /**
             * Amount in nano TON
             */
            amount: string;
            /**
             * Payload Bag of cells encoded in base64
             */
            payload: string;
            /**
             * State init encoded in base64
             */
            state_init: string;
        }[];
        error_code: number;
        error_message: string;
    };

export type SignDataRequestInitiatedEvent = TonConnectBaseEvent &
    WalletInfo &
    SessionInfo & {
        event_name: 'sign-data-request-initiated';
    };

export type SignDataRequestCompletedEvent = TonConnectBaseEvent &
    WalletInfo &
    SessionInfo & {
        event_name: 'sign-data-request-completed';
    };

export type SignDataRequestFailedEvent = TonConnectBaseEvent &
    WalletInfo &
    SessionInfo & {
        event_name: 'sign-data-request-failed';
        sign_data_type: 'text' | 'cell' | 'binary';
        sign_data_schema?: string;
        sign_data_value: string;
        error_code: number;
        error_message: string;
    };

export type BridgeClientConnectStartedEvent = BaseEvent & {
    event_name: 'bridge-client-connect-started';
    bridge_url: string;
    client_id: string;
};
export type BridgeClientConnectEstablishedEvent = BaseEvent & {
    event_name: 'bridge-client-connect-established';
    bridge_url: string;
    client_id: string;
    /**
     * Time spent to connect to the TON Connect bridge (miliseconds)
     */
    bridge_connect_duration: number;
};
export type BridgeClientConnectErrorEvent = BaseEvent & {
    event_name: 'bridge-client-connect-error';
    bridge_url: string;
    client_id: string;
    error_message: string;
};
export type BridgeClientMessageSentEvent = BaseEvent & {
    event_name: 'bridge-client-message-sent';
    bridge_url: string;
    client_id: string;
    wallet_id: string;
    message_id: string;
    request_type: string;
    encrypted_message_hash?: string;
};

export type BridgeClientMessageReceivedEvent = BaseEvent & {
    event_name: 'bridge-client-message-received';
    bridge_url: string;
    client_id: string;
    wallet_id: string;
    message_id: string;
    request_type: string;
    encrypted_message_hash?: string;
};

export type BridgeClientMessageDecodeErrorEvent = BaseEvent & {
    event_name: 'bridge-client-message-decode-error';
    bridge_url: string;
    client_id: string;
    wallet_id: string;
    error_message: string;
    encrypted_message_hash?: string;
};

export type BaseJsBridgeEvent = BaseEvent & {
    bridge_key: string;
    js_bridge_method: string;
    wallet_app_name: string;
    wallet_app_version: string;
};

export type JsBridgeCall = BaseJsBridgeEvent & {
    event_name: 'js-bridge-call';
};
export type JsBridgeResponse = BaseJsBridgeEvent & {
    event_name: 'js-bridge-response';
};
export type JsBridgeError = BaseJsBridgeEvent & {
    event_name: 'js-bridge-error';
    error_message: string;
};

export type TonConnectEvent =
    | ConnectionStartedEvent
    | ConnectionInitiatedEvent
    | ConnectionLinkGeneratedEvent
    | ConnectionSelectedWallet
    | WalletPreselectedEvent
    | WalletSelectedEvent
    | ConnectionCompletedEvent
    | ConnectionErrorEvent
    | DisconnectionEvent
    | TransactionSentEvent
    | TransactionSignedEvent
    | TransactionSigningFailedEvent
    | SignDataRequestInitiatedEvent
    | SignDataRequestCompletedEvent
    | SignDataRequestFailedEvent;

export type BridgeClientEvent =
    | BridgeClientConnectStartedEvent
    | BridgeClientConnectEstablishedEvent
    | BridgeClientConnectErrorEvent
    | BridgeClientMessageSentEvent
    | BridgeClientMessageReceivedEvent
    | BridgeClientMessageDecodeErrorEvent;

export type JsBridgeEvent = JsBridgeCall | JsBridgeResponse | JsBridgeError;

export type AnalyticsEvent = TonConnectEvent | BridgeClientEvent | JsBridgeEvent;
