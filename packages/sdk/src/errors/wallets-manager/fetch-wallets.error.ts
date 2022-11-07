import { TonConnectError } from 'src/errors/ton-connect.error';

export class FetchWalletsError extends TonConnectError {
    constructor(...args: ConstructorParameters<typeof TonConnectError>) {
        super(...args);

        Object.setPrototypeOf(this, FetchWalletsError.prototype);
    }
}
