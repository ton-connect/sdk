import { TonConnectUIReactError } from './ton-connect-ui-react.error';

/**
 * Thrown when a TonConnect UI hook or `<TonConnectButton>` is used outside of `<TonConnectUIProvider>`.
 * Wrap the part of the tree that needs TonConnect access in `<TonConnectUIProvider>`.
 */
export class TonConnectProviderNotSetError extends TonConnectUIReactError {
    /**
     * Construct a `TonConnectProviderNotSetError`. The library raises this
     * error internally when `checkProvider` sees a `null` context; consumers
     * normally only need to catch it, not construct it.
     */
    constructor(...args: ConstructorParameters<typeof Error>) {
        super(...args);

        Object.setPrototypeOf(this, TonConnectProviderNotSetError.prototype);
    }
}
