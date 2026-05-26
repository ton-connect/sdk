import { FeatureName } from '@tonconnect/protocol';
import { TonConnectError } from 'src/errors/ton-connect.error';
import { RequiredFeatures } from 'src/models';

/**
 * Thrown when the dApp issues a request the connected wallet does not
 * advertise support for — e.g. `signMessage` on a wallet missing the
 * {@link SignMessageFeature}, or `signData({ type: 'cell' })` on a wallet whose
 * {@link SignDataFeature.types} lacks `'cell'`.
 *
 * `cause.requiredFeature` reflects what the SDK looked for, so the UI can
 * tell the user which capability is missing and prompt them to switch wallet.
 *
 * @see [`Feature` (Connect spec)](https://github.com/ton-blockchain/ton-connect/blob/main/spec/connect.md#feature)
 */
export class WalletNotSupportFeatureError extends TonConnectError {
    declare cause: {
        requiredFeature: {
            featureName: FeatureName;
            value?: RequiredFeatures[keyof RequiredFeatures];
        };
    };

    protected get info(): string {
        return "Wallet doesn't support requested feature method.";
    }

    constructor(
        message: string,
        options: {
            cause: {
                requiredFeature: {
                    featureName: FeatureName;
                    value?: RequiredFeatures[keyof RequiredFeatures];
                };
            };
        }
    ) {
        super(message, options);

        Object.setPrototypeOf(this, WalletNotSupportFeatureError.prototype);
    }
}
