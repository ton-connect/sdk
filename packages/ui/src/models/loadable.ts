/** A value that is either loading or ready. Used for async state passed into the UI (e.g. `setConnectRequestParameters`). */
export type Loadable<T> = LoadableLoading | LoadableReady<T>;

/** Indicates that the value is not yet available. */
export type LoadableLoading = {
    state: 'loading';
};

/** Indicates that the value is available. */
export type LoadableReady<T> = {
    state: 'ready';

    value: T;
};
