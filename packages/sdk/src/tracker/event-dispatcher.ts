/**
 * Interface for an event dispatcher that sends events.
 */
export interface EventDispatcher<T> {
    /**
     * Dispatches an event with the given name and details.
     * @param eventName - The name of the event to dispatch.
     * @param eventDetails - The details of the event to dispatch.
     */
    dispatchEvent(eventName: string, eventDetails: T): Promise<void>;
}
