import { TonConnectUiReactError } from './ton-connect-ui-react.error';

export class TonConnectProviderNotSetError extends TonConnectUiReactError {
    constructor(...args: ConstructorParameters<typeof Error>) {
        super(...args);

        Object.setPrototypeOf(this, TonConnectProviderNotSetError.prototype);
    }
}
