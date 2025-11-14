import { TonConnectError } from 'src/errors/ton-connect.error';

export class WalletWrongNetworkError extends TonConnectError<{
    expectedChainId: string;
    actualChainId: string;
}> {
    constructor(
        message: string,
        options: {
            cause: { expectedChainId: string; actualChainId: string };
        }
    ) {
        super(message, options);
        this.name = 'WalletWrongNetworkError';
        Object.setPrototypeOf(this, WalletWrongNetworkError.prototype);
    }
}
