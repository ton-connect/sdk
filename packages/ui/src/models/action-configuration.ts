import { ReturnStrategy } from 'src/models/return-strategy';

/**
 * Modal / notification behavior for action calls
 * (`sendTransaction`, `signData`, `signMessage`) and the return strategy
 * applied to outgoing deep links.
 *
 * Pass on `TonConnectUiOptions.actionsConfiguration` (applies to every
 * action) or on the per-call options of a single action.
 *
 * @see [Send a transaction § UX (docs)](https://docs.ton.org/applications/ton-connect/how-to/send-transaction)
 */
export interface ActionConfiguration {
    /**
     * Which lifecycle stages render a modal. `'all'` is shorthand for
     * `['before', 'success', 'error']`. The "before" modal shows when the
     * user is sent to the wallet; "success" / "error" render after the wallet replies.
     *
     * @default ['before']
     */
    modals?: ('before' | 'success' | 'error')[] | 'all';

    /**
     * Which lifecycle stages emit a toast notification. `'all'` is
     * shorthand for `['before', 'success', 'error']`.
     *
     * @default 'all'
     */
    notifications?: ('before' | 'success' | 'error')[] | 'all';

    /**
     * Where the wallet should send the user after they approve or decline.
     * See {@link ReturnStrategy} — `'back'` returns to the originating app,
     * `'none'` does nothing, a custom `protocol://...` opens that URL.
     *
     * @default 'back'
     */
    returnStrategy?: ReturnStrategy;

    /**
     * Return target used when the dApp is itself a TWA and the
     * connected wallet is also a TWA. The native back jump does not work
     * across TWAs, so the dApp must pass an explicit link to come back to.
     *
     * Falls back to `returnStrategy` when the wallet is not a TMA.
     */
    twaReturnUrl?: `${string}://${string}`;

    /**
     * @deprecated The SDK now detects the right behavior automatically for
     *             TWA-TWA connections; setting this has no effect.
     */
    skipRedirectToWallet?: 'ios' | 'always' | 'never';
}

/**
 * Internal canonical form of {@link ActionConfiguration} — `'all'` is
 * expanded to the explicit array, every field is required. Used by the SDK
 * after merging defaults with user-provided options.
 */
export type StrictActionConfiguration = {
    [key in keyof Omit<ActionConfiguration, 'twaReturnUrl'>]-?: Exclude<
        ActionConfiguration[key],
        'all'
    >;
} & { twaReturnUrl: ActionConfiguration['twaReturnUrl'] };
