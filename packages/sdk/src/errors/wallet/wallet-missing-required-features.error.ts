import { ConnectEventSuccess } from '@tonconnect/protocol';
import { TonConnectError } from 'src/errors/ton-connect.error';

/**
 * Thrown when the connected wallet's `device.features` do not satisfy the
 * features required by `walletsRequiredFeatures` (passed to the TonConnect
 * constructor). The check happens after the wallet returns a successful
 * connect response and runs through `checkRequiredWalletFeatures`.
 */
export class WalletMissingRequiredFeaturesError extends TonConnectError<{
    connectEvent: ConnectEventSuccess['payload'];
}> {
    declare cause: {
        connectEvent: ConnectEventSuccess['payload'];
    };

    protected get info(): string {
        return 'Missing required features. You need to update your wallet.';
    }

    constructor(
        message: string,
        options: {
            cause: {
                connectEvent: ConnectEventSuccess['payload'];
            };
        }
    ) {
        super(message, options);

        Object.setPrototypeOf(this, WalletMissingRequiredFeaturesError.prototype);
    }
}
