import { TonConnectUIReactError } from './ton-connect-ui-react.error';

/**
 * Thrown when either <TonConnectProvider> not added to the top of the tags tree,
 * either there is an attempt using TonConnect UI hook or <TonConnectButton> inside <TonConnectProvider>
 */
export class TonConnectProviderNotSetError extends TonConnectUIReactError {
    constructor(...args: ConstructorParameters<typeof Error>) {
        super(...args);

        Object.setPrototypeOf(this, TonConnectProviderNotSetError.prototype);
    }
}
