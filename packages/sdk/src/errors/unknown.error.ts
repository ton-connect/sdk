import { TonConnectError } from 'src/errors/ton-connect.error';

/**
 * Unhandled unknown error.
 */
export class UnknownError extends TonConnectError {
    constructor(...args: ConstructorParameters<typeof TonConnectError>) {
        super(...args);

        Object.setPrototypeOf(this, UnknownError.prototype);
    }
}
