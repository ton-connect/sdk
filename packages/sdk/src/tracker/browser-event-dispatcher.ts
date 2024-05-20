import { getWindow } from 'src/utils/web-api';
import { EventDispatcher } from 'src/tracker/event-dispatcher';

/**
 * A concrete implementation of EventDispatcher that dispatches events to the browser window.
 */
export class BrowserEventDispatcher<T> implements EventDispatcher<T> {
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
    public async dispatchEvent(eventName: string, eventDetails: T): Promise<void> {
        const event = new CustomEvent<T>(eventName, { detail: eventDetails });
        this.window?.dispatchEvent(event);
    }
}
