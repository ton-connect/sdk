import { TonConnectUIError } from 'src/errors/ton-connect-ui.error';

export class WalletNotFoundError extends TonConnectUIError {
    constructor(...args: ConstructorParameters<typeof Error>) {
        super(...args);

        Object.setPrototypeOf(this, WalletNotFoundError.prototype);
    }
}
