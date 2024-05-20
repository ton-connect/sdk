import {
    createConnectionRestoringCompletedEvent,
    createConnectionRestoringErrorEvent,
    createConnectionRestoringStartedEvent,
    createDisconnectionEvent,
    createTransactionSentForSignatureEvent,
    createTransactionSignedEvent,
    createTransactionSigningFailedEvent,
    SdkActionEvent, createConnectionStartedEvent, createConnectionErrorEvent, createConnectionCompletedEvent
} from './types';
import { EventDispatcher } from 'src/tracker/event-dispatcher';
import { BrowserEventDispatcher } from 'src/tracker/browser-event-dispatcher';

/**
 * Tracker for TonConnect user actions, such as transaction signing, connection, etc.
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
 *
 * If you want to track user actions, you can subscribe to the window events with prefix `ton-connect-`:
 *
 * @example
 * window.addEventListener('ton-connect-transaction-sent-for-signature', (event) => {
 *    console.log('Transaction init', event.detail);
 * });
 *
 * @internal
 */
export class TonConnectTracker {
    /**
     * Event prefix for user actions.
     * @private
     */
    private readonly eventPrefix = 'ton-connect-';

    /**
     * Event dispatcher to track user actions. By default, it uses `window.dispatchEvent` for browser environment.
     * @private
     */
    private readonly eventDispatcher: EventDispatcher<SdkActionEvent>;

    constructor(eventDispatcher?: EventDispatcher<SdkActionEvent> | null) {
        this.eventDispatcher = eventDispatcher ?? new BrowserEventDispatcher();
    }

    /**
     * Emit user action event to the window.
     * @param eventDetails
     * @private
     */
    private dispatchUserActionEvent(eventDetails: SdkActionEvent): void {
        try {
            const eventName = `${this.eventPrefix}${eventDetails.type}`;
            this.eventDispatcher.dispatchEvent(eventName, eventDetails).catch();
        } catch (e) {}
    }

    /**
     * Track connection init event.
     * @param args
     */
    public trackConnectionStarted(...args: Parameters<typeof createConnectionStartedEvent>): void {
        try {
            const event = createConnectionStartedEvent(...args);
            this.dispatchUserActionEvent(event);
        } catch (e) {}
    }

    /**
     * Track connection success event.
     * @param args
     */
    public trackConnectionCompleted(
        ...args: Parameters<typeof createConnectionCompletedEvent>
    ): void {
        try {
            const event = createConnectionCompletedEvent(...args);
            this.dispatchUserActionEvent(event);
        } catch (e) {}
    }

    /**
     * Track connection error event.
     * @param args
     */
    public trackConnectionError(...args: Parameters<typeof createConnectionErrorEvent>): void {
        try {
            const event = createConnectionErrorEvent(...args);
            this.dispatchUserActionEvent(event);
        } catch (e) {}
    }

    /**
     * Track connection restoring init event.
     * @param args
     */
    public trackConnectionRestoringStarted(
        ...args: Parameters<typeof createConnectionRestoringStartedEvent>
    ): void {
        try {
            const event = createConnectionRestoringStartedEvent(...args);
            this.dispatchUserActionEvent(event);
        } catch (e) {}
    }

    /**
     * Track connection restoring success event.
     * @param args
     */
    public trackConnectionRestoringCompleted(
        ...args: Parameters<typeof createConnectionRestoringCompletedEvent>
    ): void {
        try {
            const event = createConnectionRestoringCompletedEvent(...args);
            this.dispatchUserActionEvent(event);
        } catch (e) {}
    }

    /**
     * Track connection restoring error event.
     * @param args
     */
    public trackConnectionRestoringError(
        ...args: Parameters<typeof createConnectionRestoringErrorEvent>
    ): void {
        try {
            const event = createConnectionRestoringErrorEvent(...args);
            this.dispatchUserActionEvent(event);
        } catch (e) {}
    }

    /**
     * Track disconnect event.
     * @param args
     */
    public trackDisconnection(...args: Parameters<typeof createDisconnectionEvent>): void {
        try {
            const event = createDisconnectionEvent(...args);
            this.dispatchUserActionEvent(event);
        } catch (e) {}
    }

    /**
     * Track transaction init event.
     * @param args
     */
    public trackTransactionSentForSignature(
        ...args: Parameters<typeof createTransactionSentForSignatureEvent>
    ): void {
        try {
            const event = createTransactionSentForSignatureEvent(...args);
            this.dispatchUserActionEvent(event);
        } catch (e) {}
    }

    /**
     * Track transaction signed event.
     * @param args
     */
    public trackTransactionSigned(...args: Parameters<typeof createTransactionSignedEvent>): void {
        try {
            const event = createTransactionSignedEvent(...args);
            this.dispatchUserActionEvent(event);
        } catch (e) {}
    }

    /**
     * Track transaction error event.
     * @param args
     */
    public trackTransactionSigningFailed(
        ...args: Parameters<typeof createTransactionSigningFailedEvent>
    ): void {
        try {
            const event = createTransactionSigningFailedEvent(...args);
            this.dispatchUserActionEvent(event);
        } catch (e) {}
    }
}
