import { Feature, SendTransactionFeature } from '@tonconnect/protocol';
import { logWarning } from 'src/utils/log';
import { WalletNotSupportFeatureError } from 'src/errors/wallet';
import { RequiredFeatures, RequiredSendTransactionFeature } from 'src/models';

export function checkSendTransactionSupport(
    features: Feature[],
    options: { requiredMessagesNumber: number; requireExtraCurrencies: boolean }
): never | void {
    const supportsDeprecatedSendTransactionFeature = features.includes('SendTransaction');
    const sendTransactionFeature = findFeature(features, 'SendTransaction');
    
    const requiredFeature: RequiredSendTransactionFeature = {
        minMessages: options.requiredMessagesNumber,
        extraCurrencyRequired: options.requireExtraCurrencies
    };

    if (!supportsDeprecatedSendTransactionFeature && !sendTransactionFeature) {
        throw new WalletNotSupportFeatureError("Wallet doesn't support SendTransaction feature.", {
            cause: { requiredFeature: { featureName: 'SendTransaction', value: requiredFeature } }
        });
    }

    if (options.requireExtraCurrencies) {
        if (!sendTransactionFeature || !sendTransactionFeature.extraCurrencySupported) {
            throw new WalletNotSupportFeatureError(
                `Wallet is not able to handle such SendTransaction request. Extra currencies support is required.`,
                {
                    cause: { requiredFeature: { featureName: 'SendTransaction', value: requiredFeature } }
                }
            );
        }
    }

    if (sendTransactionFeature && sendTransactionFeature.maxMessages !== undefined) {
        if (sendTransactionFeature.maxMessages < options.requiredMessagesNumber) {
            throw new WalletNotSupportFeatureError(
                `Wallet is not able to handle such SendTransaction request. Max support messages number is ${sendTransactionFeature.maxMessages}, but ${options.requiredMessagesNumber} is required.`,
                {
                    cause: { requiredFeature: { featureName: 'SendTransaction', value: requiredFeature } }
                }
            );
        }
        return;
    }

    logWarning(
        "Connected wallet didn't provide information about max allowed messages in the SendTransaction request. Request may be rejected by the wallet."
    );
}

export function checkRequiredWalletFeatures(
    features: Feature[],
    walletsRequiredFeatures?: RequiredFeatures
): boolean {
    if (typeof walletsRequiredFeatures !== 'object') {
        return true;
    }

    const { sendTransaction } = walletsRequiredFeatures;

    if (sendTransaction) {
        const feature = findFeature(features, 'SendTransaction');
        if (!feature) {
            return false;
        }

        if (!checkSendTransaction(feature, sendTransaction)) {
            return false;
        }
    }

    return true;
}

function findFeature<T extends Exclude<Feature, 'SendTransaction'>, P extends T['name']>(
    features: Feature[],
    requiredFeatureName: P
): (T & { name: P }) | undefined {
    return features.find(f => f && typeof f === 'object' && f.name === requiredFeatureName) as
        | (T & {
              name: P;
          })
        | undefined;
}

function checkSendTransaction(
    feature: SendTransactionFeature,
    requiredFeature: RequiredSendTransactionFeature
): boolean {
    const correctMessagesNumber =
        requiredFeature.minMessages === undefined ||
        requiredFeature.minMessages <= feature.maxMessages;

    const correctExtraCurrency =
        !requiredFeature.extraCurrencyRequired || feature.extraCurrencySupported;

    return !!(correctMessagesNumber && correctExtraCurrency);
}
