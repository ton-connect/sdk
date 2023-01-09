export interface ActionConfiguration {
    /**
     * Configure action modals behavior.
     * @default ['before']
     */
    modals?: ('before' | 'success' | 'error')[] | 'all';

    /**
     * Configure action notifications behavior.
     * @default 'all'
     */
    notifications?: ('before' | 'success' | 'error')[] | 'all';
}

export type StrictActionConfiguration = {
    [key in keyof ActionConfiguration]-?: Exclude<ActionConfiguration[key], 'all'>;
};
