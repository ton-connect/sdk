import { TonConnectError } from 'src/errors/ton-connect.error';

export class WalletAlreadyConnectedError extends TonConnectError {
    constructor(...args: ConstructorParameters<typeof TonConnectError>) {
        super(...args);

        Object.setPrototypeOf(this, WalletAlreadyConnectedError.prototype);
    }
}
