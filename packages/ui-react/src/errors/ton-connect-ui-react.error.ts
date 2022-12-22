import { TonConnectUIError } from '@tonconnect/ui';

export class TonConnectUiReactError extends TonConnectUIError {
    constructor(...args: ConstructorParameters<typeof Error>) {
        super(...args);

        Object.setPrototypeOf(this, TonConnectUiReactError.prototype);
    }
}
