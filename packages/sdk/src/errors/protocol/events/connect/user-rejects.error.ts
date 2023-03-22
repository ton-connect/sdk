import { TonConnectError } from 'src/errors/ton-connect.error';

/**
 * Thrown when user rejects the action in the wallet.
 */
export class UserRejectsError extends TonConnectError {
    protected get info(): string {
        return 'User rejects the action in the wallet.';
    }

    constructor(...args: ConstructorParameters<typeof TonConnectError>) {
        super(...args);

        Object.setPrototypeOf(this, UserRejectsError.prototype);
    }
}
