import { TonConnectError } from 'src/errors/ton-connect.error';

/**
 * Thrown when request to the wallet contains errors.
 */
export class BadRequestError extends TonConnectError {
    protected get info(): string {
        return 'Request to the wallet contains errors.';
    }

    constructor(...args: ConstructorParameters<typeof TonConnectError>) {
        super(...args);

        Object.setPrototypeOf(this, BadRequestError.prototype);
    }
}
