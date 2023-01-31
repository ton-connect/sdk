import { TonConnectError } from 'src/errors/ton-connect.error';

/**
 * Thrown when there is an attempt to connect to the injected wallet while it is not exists in the webpage.
 */
export class WalletNotInjectedError extends TonConnectError {
    info =
        'There is an attempt to connect to the injected wallet while it is not exists in the webpage.';

    constructor(...args: ConstructorParameters<typeof TonConnectError>) {
        super(...args);

        Object.setPrototypeOf(this, WalletNotInjectedError.prototype);
    }
}
