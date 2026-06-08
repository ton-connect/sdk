import { ConnectEventSuccess } from '@tonconnect/protocol';
import { TonConnectError } from 'src/errors/ton-connect.error';

/**
 * Thrown when a wallet completes the connect handshake but its advertised
 * `DeviceInfo.features` do not satisfy the dApp's
 * `walletsRequiredFeatures` filter. The SDK aborts the connection and emits
 * this error to `onStatusChange`'s error handler.
 *
 * Use `cause.connectEvent` to inspect what the wallet returned (its
 * `DeviceInfo`, the `ConnectItemReply` array) when surfacing a useful
 * message to the user.
 *
 * @see [Filter wallets by required features (docs)](https://docs.ton.org/applications/ton-connect/how-to/filter-wallets)
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
