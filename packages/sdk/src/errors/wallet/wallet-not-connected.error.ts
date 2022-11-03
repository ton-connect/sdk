import { TonConnectError } from 'src/errors/ton-connect.error';

export class WalletNotConnectedError extends TonConnectError {
    constructor(...args: ConstructorParameters<typeof TonConnectError>) {
        super(...args);

        Object.setPrototypeOf(this, WalletNotConnectedError.prototype);
    }
}
