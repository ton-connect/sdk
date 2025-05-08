import { Feature, SendTransactionFeature, SignDataFeature } from '@tonconnect/protocol';
import { logWarning } from 'src/utils/log';
import { WalletNotSupportFeatureError } from 'src/errors/wallet';
import {
    RequiredFeatures,
    RequiredSendTransactionFeature,
    RequiredSignDataFeature
} from 'src/models';

export function checkSendTransactionSupport(
    features: Feature[],
    options: { requiredMessagesNumber: number; requireExtraCurrencies: boolean }
): never | void {
    const supportsDeprecatedSendTransactionFeature = features.includes('SendTransaction');
    const sendTransactionFeature = findFeature(features, 'SendTransaction');

    if (!supportsDeprecatedSendTransactionFeature && !sendTransactionFeature) {
        throw new WalletNotSupportFeatureError("Wallet doesn't support SendTransaction feature.");
    }

    if (options.requireExtraCurrencies) {
        if (!sendTransactionFeature || !sendTransactionFeature.extraCurrencySupported) {
            throw new WalletNotSupportFeatureError(
                `Wallet is not able to handle such SendTransaction request. Extra currencies support is required.`
            );
        }
    }

    if (sendTransactionFeature && sendTransactionFeature.maxMessages !== undefined) {
        if (sendTransactionFeature.maxMessages < options.requiredMessagesNumber) {
            throw new WalletNotSupportFeatureError(
                `Wallet is not able to handle such SendTransaction request. Max support messages number is ${sendTransactionFeature.maxMessages}, but ${options.requiredMessagesNumber} is required.`
            );
        }
        return;
    }

    logWarning(
        "Connected wallet didn't provide information about max allowed messages in the SendTransaction request. Request may be rejected by the wallet."
    );
}

export function checkSignDataSupport(
    features: Feature[],
    options: { requiredTypes: SignDataFeature['types'] }
): never | void {
    const signDataFeature = features.find(
        feature => feature && typeof feature === 'object' && feature.name === 'SignData'
    ) as SignDataFeature;

    if (!signDataFeature) {
        throw new WalletNotSupportFeatureError("Wallet doesn't support SignData feature.");
    }

    const unsupportedTypes = options.requiredTypes.filter(
        requiredType => !signDataFeature.types.includes(requiredType)
    );

    if (unsupportedTypes.length) {
        throw new WalletNotSupportFeatureError(
            `Wallet doesn't support required SignData types: ${unsupportedTypes.join(', ')}.`);
    }
}

export function checkRequiredWalletFeatures(
    features: Feature[],
    walletsRequiredFeatures?: RequiredFeatures
): boolean {
    if (typeof walletsRequiredFeatures !== 'object') {
        return true;
    }

    const { sendTransaction, signData } = walletsRequiredFeatures;

    if (sendTransaction) {
        const feature = findFeature(features, 'SendTransaction');
        if (!feature) {
            return false;
        }

        if (!checkSendTransaction(feature, sendTransaction)) {
            return false;
        }
    }

    if (signData) {
        const feature = findFeature(features, 'SignData');
        if (!feature) {
            return false;
        }

        if (!checkSignData(feature, signData)) {
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

function checkSignData(
    feature: SignDataFeature,
    requiredFeature: RequiredSignDataFeature
): boolean {
    return requiredFeature.types.every(requiredType => feature.types.includes(requiredType));
}
