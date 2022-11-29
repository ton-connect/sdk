import { TonConnectError } from 'src/errors/ton-connect.error';

/**
 * Thrown when user rejects the action in the wallet.
 */
export class UserRejectsError extends TonConnectError {
    constructor(...args: ConstructorParameters<typeof TonConnectError>) {
        super(...args);

        Object.setPrototypeOf(this, UserRejectsError.prototype);
    }
}
