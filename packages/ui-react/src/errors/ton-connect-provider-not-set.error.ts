import { TonConnectUIReactError } from './ton-connect-ui-react.error';

/**
 * Thrown when a hook from `@tonconnect/ui-react` (or `<TonConnectButton />`)
 * is used outside the subtree rendered by `<TonConnectUIProvider>`. Add the
 * provider near the top of your React tree.
 */
export class TonConnectProviderNotSetError extends TonConnectUIReactError {
    constructor(...args: ConstructorParameters<typeof Error>) {
        super(...args);

        Object.setPrototypeOf(this, TonConnectProviderNotSetError.prototype);
    }
}
