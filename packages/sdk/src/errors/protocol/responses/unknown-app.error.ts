import { TonConnectError } from 'src/errors/ton-connect.error';

/**
 * Thrown when app tries to send rpc request to the injected wallet while not connected.
 */
export class UnknownAppError extends TonConnectError {
    constructor(...args: ConstructorParameters<typeof TonConnectError>) {
        super(...args);

        Object.setPrototypeOf(this, UnknownAppError.prototype);
    }
}
