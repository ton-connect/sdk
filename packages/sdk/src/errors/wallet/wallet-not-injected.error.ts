import { TonConnectError } from 'src/errors/ton-connect.error';

export class WalletNotInjectedError extends TonConnectError {
    constructor(...args: ConstructorParameters<typeof TonConnectError>) {
        super(...args);

        Object.setPrototypeOf(this, WalletNotInjectedError.prototype);
    }
}
