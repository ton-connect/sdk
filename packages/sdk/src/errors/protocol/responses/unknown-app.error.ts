import { TonConnectError } from 'src/errors/ton-connect.error';

export class UnknownAppError extends TonConnectError {
    constructor(...args: ConstructorParameters<typeof TonConnectError>) {
        super(...args);

        Object.setPrototypeOf(this, UnknownAppError.prototype);
    }
}
