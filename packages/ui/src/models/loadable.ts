export type Loadable<T> = LoadableLoading | LoadableReady<T>;

export type LoadableLoading = {
    state: 'loading';
};

export type LoadableReady<T> = {
    state: 'ready';

    value: T;
};
