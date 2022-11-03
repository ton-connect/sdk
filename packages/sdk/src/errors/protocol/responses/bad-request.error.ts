import { TonConnectError } from 'src/errors/ton-connect.error';

export class BadRequestError extends TonConnectError {
    constructor(...args: ConstructorParameters<typeof TonConnectError>) {
        super(...args);

        Object.setPrototypeOf(this, BadRequestError.prototype);
    }
}
