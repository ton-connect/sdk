import {
    createConnectionCompletedEvent,
    createConnectionErrorEvent,
    createConnectionRestoringCompletedEvent,
    createConnectionRestoringErrorEvent,
    createConnectionRestoringStartedEvent,
    createConnectionStartedEvent,
    createDisconnectionEvent,
    createRequestVersionEvent,
    createResponseVersionEvent,
    createSelectedWalletEvent,
    createTransactionSentForSignatureEvent,
    createTransactionSignedEvent,
    createTransactionSigningFailedEvent,
    createWalletModalOpenedEvent,
    UserActionEvent
} from './types';
import {
    createDataSentForSignatureEvent,
    createDataSignedEvent,
    createDataSigningFailedEvent,
    createVersionInfo,
    EventDispatcher,
    ResponseVersionEvent,
    Version,
    WithoutVersion
} from '@tonconnect/sdk';
import { logError } from 'src/app/utils/log';

export type TonConnectUITrackerOptions = {
    /**
     * Event dispatcher to track user actions.
     */
    eventDispatcher: EventDispatcher<UserActionEvent>;
    /**
     * TonConnect UI version.
     */
    tonConnectUiVersion: string;
};

/**
 * Tracker for TonConnectUI user actions, such as transaction signing, connection, etc.
 *
 * List of events:
 *  * `connection-started`: when a user starts connecting a wallet.
 *  * `connection-completed`: when a user successfully connected a wallet.
 *  * `connection-error`: when a user cancels a connection or there is an error during the connection process.
 *  * `connection-restoring-started`: when the dApp starts restoring a connection.
 *  * `connection-restoring-completed`: when the dApp successfully restores a connection.
 *  * `connection-restoring-error`: when the dApp fails to restore a connection.
 *  * `disconnection`: when a user starts disconnecting a wallet.
 *  * `transaction-sent-for-signature`: when a user sends a transaction for signature.
 *  * `transaction-signed`: when a user successfully signs a transaction.
 *  * `transaction-signing-failed`: when a user cancels transaction signing or there is an error during the signing process.
 *  * `sign-data-request-initiated`: when a user initiates a data signing request.
 *  * `sign-data-request-completed`: when a user successfully signs data.
 *  * `sign-data-request-failed`: when a user cancels data signing or there is an error during the signing process.
 *
 * If you want to track user actions, you can subscribe to the window events with prefix `ton-connect-ui-`:
 *
 * @example
 * window.addEventListener('ton-connect-ui-transaction-sent-for-signature', (event) => {
 *    console.log('Transaction init', event.detail);
 * });
 *
 * @internal
 */
export class TonConnectUITracker {
    /**
     * Event prefix for user actions.
     * @private
     */
    private readonly eventPrefix = 'ton-connect-ui-';

    /**
     * TonConnect UI version.
     */
    private readonly tonConnectUiVersion: string;

    /**
     * TonConnect SDK version.
     */
    private tonConnectSdkVersion: string | null = null;

    /**
     * Version of the library.
     */
    get version(): Version {
        return createVersionInfo({
            ton_connect_sdk_lib: this.tonConnectSdkVersion,
            ton_connect_ui_lib: this.tonConnectUiVersion
        });
    }

    /**
     * Event dispatcher to track user actions. By default, it uses `window.dispatchEvent` for browser environment.
     * @private
     */
    private readonly eventDispatcher: EventDispatcher<UserActionEvent>;

    constructor(options: TonConnectUITrackerOptions) {
        this.eventDispatcher = options?.eventDispatcher;
        this.tonConnectUiVersion = options.tonConnectUiVersion;

        this.init().catch();
    }

    /**
     * Called once when the tracker is created and request version other libraries.
     */
    private async init(): Promise<void> {
        try {
            await this.setRequestVersionHandler();
            this.tonConnectSdkVersion = await this.requestTonConnectSdkVersion();
        } catch (e) {}
    }

    /**
     * Set request version handler.
     * @private
     */
    private async setRequestVersionHandler(): Promise<void> {
        await this.eventDispatcher.addEventListener('ton-connect-ui-request-version', async () => {
            await this.eventDispatcher.dispatchEvent(
                'ton-connect-ui-response-version',
                createResponseVersionEvent(this.tonConnectUiVersion)
            );
        });
    }

    /**
     * Request TonConnect SDK version.
     * @private
     */
    private async requestTonConnectSdkVersion(): Promise<string> {
        return new Promise(async (resolve, reject) => {
            try {
                await this.eventDispatcher.addEventListener(
                    'ton-connect-response-version',
                    (event: CustomEvent<ResponseVersionEvent>) => {
                        resolve(event.detail.version);
                    },
                    { once: true }
                );
                await this.eventDispatcher.dispatchEvent(
                    'ton-connect-request-version',
                    createRequestVersionEvent()
                );
            } catch (e) {
                reject(e);
            }
        });
    }

    /**
     * Emit user action event to the window.
     * @param eventDetails
     * @private
     */
    private dispatchUserActionEvent(eventDetails: UserActionEvent): void {
        try {
            this.eventDispatcher
                ?.dispatchEvent(`${this.eventPrefix}${eventDetails.type}`, eventDetails)
                .catch();
        } catch (e) {}
    }

    /**
     * Track wallet opened event.
     * @param args
     */
    public trackWalletModalOpened(
        ...args: WithoutVersion<Parameters<typeof createWalletModalOpenedEvent>>
    ): void {
        try {
            const event = createWalletModalOpenedEvent(this.version, ...args);
            this.dispatchUserActionEvent(event);
        } catch (e) {}
    }

    /**
     * Track wallet selected event.
     * @param args
     */
    public trackSelectedWallet(
        ...args: WithoutVersion<Parameters<typeof createSelectedWalletEvent>>
    ): void {
        try {
            const event = createSelectedWalletEvent(this.version, ...args);
            this.dispatchUserActionEvent(event);
        } catch (e) {
            logError(e);
        }
    }

    /**
     * Track connection init event.
     * @param args
     */
    public trackConnectionStarted(
        ...args: WithoutVersion<Parameters<typeof createConnectionStartedEvent>>
    ): void {
        try {
            const event = createConnectionStartedEvent(this.version, ...args);
            this.dispatchUserActionEvent(event);
        } catch (e) {}
    }

    /**
     * Track connection success event.
     * @param args
     */
    public trackConnectionCompleted(
        ...args: WithoutVersion<Parameters<typeof createConnectionCompletedEvent>>
    ): void {
        try {
            const event = createConnectionCompletedEvent(this.version, ...args);
            this.dispatchUserActionEvent(event);
        } catch (e) {}
    }

    /**
     * Track connection error event.
     * @param args
     */
    public trackConnectionError(
        ...args: WithoutVersion<Parameters<typeof createConnectionErrorEvent>>
    ): void {
        try {
            const event = createConnectionErrorEvent(this.version, ...args);
            this.dispatchUserActionEvent(event);
        } catch (e) {}
    }

    /**
     * Track connection restoring init event.
     * @param args
     */
    public trackConnectionRestoringStarted(
        ...args: WithoutVersion<Parameters<typeof createConnectionRestoringStartedEvent>>
    ): void {
        try {
            const event = createConnectionRestoringStartedEvent(this.version, ...args);
            this.dispatchUserActionEvent(event);
        } catch (e) {}
    }

    /**
     * Track connection restoring success event.
     * @param args
     */
    public trackConnectionRestoringCompleted(
        ...args: WithoutVersion<Parameters<typeof createConnectionRestoringCompletedEvent>>
    ): void {
        try {
            const event = createConnectionRestoringCompletedEvent(this.version, ...args);
            this.dispatchUserActionEvent(event);
        } catch (e) {}
    }

    /**
     * Track connection restoring error event.
     * @param args
     */
    public trackConnectionRestoringError(
        ...args: WithoutVersion<Parameters<typeof createConnectionRestoringErrorEvent>>
    ): void {
        try {
            const event = createConnectionRestoringErrorEvent(this.version, ...args);
            this.dispatchUserActionEvent(event);
        } catch (e) {}
    }

    /**
     * Track disconnect event.
     * @param args
     */
    public trackDisconnection(
        ...args: WithoutVersion<Parameters<typeof createDisconnectionEvent>>
    ): void {
        try {
            const event = createDisconnectionEvent(this.version, ...args);
            this.dispatchUserActionEvent(event);
        } catch (e) {}
    }

    /**
     * Track transaction init event.
     * @param args
     */
    public trackTransactionSentForSignature(
        ...args: WithoutVersion<Parameters<typeof createTransactionSentForSignatureEvent>>
    ): void {
        try {
            const event = createTransactionSentForSignatureEvent(this.version, ...args);
            this.dispatchUserActionEvent(event);
        } catch (e) {}
    }

    /**
     * Track transaction signed event.
     * @param args
     */
    public trackTransactionSigned(
        ...args: WithoutVersion<Parameters<typeof createTransactionSignedEvent>>
    ): void {
        try {
            const event = createTransactionSignedEvent(this.version, ...args);
            this.dispatchUserActionEvent(event);
        } catch (e) {}
    }

    /**
     * Track transaction error event.
     * @param args
     */
    public trackTransactionSigningFailed(
        ...args: WithoutVersion<Parameters<typeof createTransactionSigningFailedEvent>>
    ): void {
        try {
            const event = createTransactionSigningFailedEvent(this.version, ...args);
            this.dispatchUserActionEvent(event);
        } catch (e) {}
    }

    /**
     * Track data sent for signature event.
     * @param args
     */
    public trackDataSentForSignature(
        ...args: WithoutVersion<Parameters<typeof createDataSentForSignatureEvent>>
    ): void {
        try {
            const event = createDataSentForSignatureEvent(this.version, ...args);
            this.dispatchUserActionEvent(event);
        } catch (e) {}
    }

    /**
     * Track data signed event.
     * @param args
     */
    public trackDataSigned(
        ...args: WithoutVersion<Parameters<typeof createDataSignedEvent>>
    ): void {
        try {
            const event = createDataSignedEvent(this.version, ...args);
            this.dispatchUserActionEvent(event);
        } catch (e) {}
    }

    /**
     * Track data signing error event.
     * @param args
     */
    public trackDataSigningFailed(
        ...args: WithoutVersion<Parameters<typeof createDataSigningFailedEvent>>
    ): void {
        try {
            const event = createDataSigningFailedEvent(this.version, ...args);
            this.dispatchUserActionEvent(event);
        } catch (e) {}
    }
}
