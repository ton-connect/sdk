import { FeatureName } from '@tonconnect/protocol';
import { TonConnectError } from 'src/errors/ton-connect.error';
import { RequiredFeatures } from 'src/models';
/**
 * Thrown when wallet doesn't support requested feature method.
 */
export class WalletNotSupportFeatureError extends TonConnectError {
    declare cause: {
        requiredFeature: {
            featureName: FeatureName;
            value?: RequiredFeatures['sendTransaction'] | RequiredFeatures['signData'];
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
                    value?: RequiredFeatures['sendTransaction'] | RequiredFeatures['signData'];
                };
            };
        }
    ) {
        super(message, options);

        Object.setPrototypeOf(this, WalletNotSupportFeatureError.prototype);
    }
}
