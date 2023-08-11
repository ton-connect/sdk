import { ReturnStrategy } from 'src/models/return-strategy';

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

    /**
     * Specifies return strategy for the deeplink when user signs/declines the request.
     * @default 'back'
     */
    returnStrategy?: ReturnStrategy;

    /**
     * Specifies whether the method should redirect user to the connected wallet
     * @default 'ios'
     */
    skipRedirectToWallet?: 'ios' | 'always' | 'never';
}

export type StrictActionConfiguration = {
    [key in keyof ActionConfiguration]-?: Exclude<ActionConfiguration[key], 'all'>;
};
