/**
 * Removes the `ton-connect-` and `ton-connect-ui-` prefixes from the given string.
 */
export type RemoveTonConnectPrefix<T> = T extends `ton-connect-ui-${infer Rest}`
    ? Rest
    : T extends `ton-connect-${infer Rest}`
    ? Rest
    : T;

export type AddTonConnectPrefix<T extends string> = `ton-connect-${T}` | `ton-connect-ui-${T}`;

/**
 * Interface for an event dispatcher that sends events.
 */
export interface EventDispatcher<T extends { type: string }> {
    /**
     * Dispatches an event with the given name and details.
     * @param eventName - The name of the event to dispatch.
     * @param eventDetails - The details of the event to dispatch.
     */
    dispatchEvent<P extends AddTonConnectPrefix<T['type']>>(
        eventName: P,
        eventDetails: T & { type: RemoveTonConnectPrefix<P> }
    ): Promise<void>;

    /**
     * Adds an event listener.
     * @param eventName - The name of the event to listen for.
     * @param listener - The listener to add.
     * @param options - The options for the listener.
     * @returns A function that removes the listener.
     */
    addEventListener<P extends AddTonConnectPrefix<T['type']>>(
        eventName: P,
        listener: (event: CustomEvent<T & { type: RemoveTonConnectPrefix<P> }>) => void,
        options?: AddEventListenerOptions
    ): Promise<() => void>;
}
