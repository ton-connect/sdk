import { TonConnectError } from 'src/errors/ton-connect.error';

export class LocalstorageNotFoundError extends TonConnectError {
    constructor(...args: ConstructorParameters<typeof TonConnectError>) {
        super(...args);

        Object.setPrototypeOf(this, LocalstorageNotFoundError.prototype);
    }
}
