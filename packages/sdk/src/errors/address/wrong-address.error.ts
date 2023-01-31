import { TonConnectError } from 'src/errors/ton-connect.error';

/**
 * Thrown when passed address is in incorrect format.
 */
export class WrongAddressError extends TonConnectError {
    info = 'Passed address is in incorrect format.';

    constructor(...args: ConstructorParameters<typeof TonConnectError>) {
        super(...args);

        Object.setPrototypeOf(this, WrongAddressError.prototype);
    }
}
