import { getWindow } from 'src/utils/web-api';
import { AddTonConnectPrefix, EventDispatcher, RemoveTonConnectPrefix } from './event-dispatcher';

/**
 * A concrete implementation of EventDispatcher that dispatches events to the browser window.
 */
export class BrowserEventDispatcher<T extends { type: string }> implements EventDispatcher<T> {
    /**
     * The window object, possibly undefined in a server environment.
     * @private
     */
    private readonly window: Window | undefined = getWindow();

    /**
     * Dispatches an event with the given name and details to the browser window.
     * @param eventName - The name of the event to dispatch.
     * @param eventDetails - The details of the event to dispatch.
     * @returns A promise that resolves when the event has been dispatched.
     */
    public async dispatchEvent<P extends AddTonConnectPrefix<T['type']>>(
        eventName: P,
        eventDetails: T & { type: RemoveTonConnectPrefix<P> }
    ): Promise<void> {
        const event = new CustomEvent<T>(eventName, { detail: eventDetails });
        this.window?.dispatchEvent(event);
    }

    /**
     * Adds an event listener to the browser window.
     * @param eventName - The name of the event to listen for.
     * @param listener - The listener to add.
     * @param options - The options for the listener.
     * @returns A function that removes the listener.
     */
    public async addEventListener<P extends AddTonConnectPrefix<T['type']>>(
        eventName: P,
        listener: (event: CustomEvent<T & { type: RemoveTonConnectPrefix<P> }>) => void,
        options?: AddEventListenerOptions
    ): Promise<() => void> {
        this.window?.addEventListener(
            eventName,
            listener as EventListener | EventListenerObject,
            options
        );
        return () =>
            this.window?.removeEventListener(
                eventName,
                listener as EventListener | EventListenerObject
            );
    }
}
