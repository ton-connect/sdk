import {
    Feature,
    SendTransactionFeature,
    SignDataFeature,
    SignMessageFeature,
    StructuredItemType
} from '@tonconnect/protocol';
import { logWarning } from 'src/utils/log';
import { WalletNotSupportFeatureError } from 'src/errors/wallet';
import {
    RequiredFeatures,
    RequiredSendTransactionFeature,
    RequiredSignDataFeature,
    RequiredSignMessageFeature
} from 'src/models';

export function checkSendTransactionSupport(
    features: Feature[],
    options: {
        requiredMessagesNumber: number;
        requireExtraCurrencies: boolean;
        requiredItemTypes?: StructuredItemType[];
    }
): never | void {
    const supportsDeprecatedSendTransactionFeature = features.includes('SendTransaction');
    const sendTransactionFeature = findFeature(features, 'SendTransaction');

    const requiredFeature: RequiredSendTransactionFeature = {
        minMessages: options.requiredMessagesNumber,
        extraCurrencyRequired: options.requireExtraCurrencies,
        itemTypes: options.requiredItemTypes
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
                    cause: {
                        requiredFeature: { featureName: 'SendTransaction', value: requiredFeature }
                    }
                }
            );
        }
    }

    if (options.requiredItemTypes?.length) {
        if (!sendTransactionFeature?.itemTypes) {
            throw new WalletNotSupportFeatureError(
                `Wallet doesn't support structured items in SendTransaction.`,
                {
                    cause: {
                        requiredFeature: { featureName: 'SendTransaction', value: requiredFeature }
                    }
                }
            );
        }

        const unsupportedTypes = options.requiredItemTypes.filter(
            t => !sendTransactionFeature.itemTypes!.includes(t)
        );
        if (unsupportedTypes.length) {
            throw new WalletNotSupportFeatureError(
                `Wallet doesn't support item types: ${unsupportedTypes.join(', ')} in SendTransaction.`,
                {
                    cause: {
                        requiredFeature: { featureName: 'SendTransaction', value: requiredFeature }
                    }
                }
            );
        }
    }

    if (sendTransactionFeature && sendTransactionFeature.maxMessages !== undefined) {
        if (sendTransactionFeature.maxMessages < options.requiredMessagesNumber) {
            throw new WalletNotSupportFeatureError(
                `Wallet is not able to handle such SendTransaction request. Max support messages number is ${sendTransactionFeature.maxMessages}, but ${options.requiredMessagesNumber} is required.`,
                {
                    cause: {
                        requiredFeature: { featureName: 'SendTransaction', value: requiredFeature }
                    }
                }
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
        throw new WalletNotSupportFeatureError("Wallet doesn't support SignData feature.", {
            cause: {
                requiredFeature: {
                    featureName: 'SignData',
                    value: { types: options.requiredTypes }
                }
            }
        });
    }

    const unsupportedTypes = options.requiredTypes.filter(
        requiredType => !signDataFeature.types.includes(requiredType)
    );

    if (unsupportedTypes.length) {
        throw new WalletNotSupportFeatureError(
            `Wallet doesn't support required SignData types: ${unsupportedTypes.join(', ')}.`,
            {
                cause: {
                    requiredFeature: { featureName: 'SignData', value: { types: unsupportedTypes } }
                }
            }
        );
    }
}

export function checkSignMessageSupport(
    features: Feature[],
    options: {
        requiredMessagesNumber: number;
        requireExtraCurrencies: boolean;
        requiredItemTypes?: StructuredItemType[];
    }
): never | void {
    const signMessageFeature = findFeature(features, 'SignMessage');

    const requiredFeature: RequiredSignMessageFeature = {
        minMessages: options.requiredMessagesNumber,
        extraCurrencyRequired: options.requireExtraCurrencies,
        itemTypes: options.requiredItemTypes
    };

    if (!signMessageFeature) {
        throw new WalletNotSupportFeatureError("Wallet doesn't support SignMessage feature.", {
            cause: { requiredFeature: { featureName: 'SignMessage', value: requiredFeature } }
        });
    }

    if (options.requireExtraCurrencies && !signMessageFeature.extraCurrencySupported) {
        throw new WalletNotSupportFeatureError(
            `Wallet is not able to handle such SignMessage request. Extra currencies support is required.`,
            {
                cause: {
                    requiredFeature: { featureName: 'SignMessage', value: requiredFeature }
                }
            }
        );
    }

    if (options.requiredItemTypes?.length) {
        if (!signMessageFeature.itemTypes) {
            throw new WalletNotSupportFeatureError(
                `Wallet doesn't support structured items in SignMessage.`,
                {
                    cause: {
                        requiredFeature: { featureName: 'SignMessage', value: requiredFeature }
                    }
                }
            );
        }

        const unsupportedTypes = options.requiredItemTypes.filter(
            t => !signMessageFeature.itemTypes!.includes(t)
        );
        if (unsupportedTypes.length) {
            throw new WalletNotSupportFeatureError(
                `Wallet doesn't support item types: ${unsupportedTypes.join(', ')} in SignMessage.`,
                {
                    cause: {
                        requiredFeature: { featureName: 'SignMessage', value: requiredFeature }
                    }
                }
            );
        }
    }

    if (signMessageFeature.maxMessages !== undefined) {
        if (signMessageFeature.maxMessages < options.requiredMessagesNumber) {
            throw new WalletNotSupportFeatureError(
                `Wallet is not able to handle such SignMessage request. Max support messages number is ${signMessageFeature.maxMessages}, but ${options.requiredMessagesNumber} is required.`,
                {
                    cause: {
                        requiredFeature: { featureName: 'SignMessage', value: requiredFeature }
                    }
                }
            );
        }
        return;
    }

    logWarning(
        "Connected wallet didn't provide information about max allowed messages in the SignMessage request. Request may be rejected by the wallet."
    );
}

export function checkRequiredWalletFeatures(
    features: Feature[],
    walletsRequiredFeatures?: RequiredFeatures
): boolean {
    if (typeof walletsRequiredFeatures !== 'object') {
        return true;
    }

    const { sendTransaction, signData, signMessage, embeddedRequest } = walletsRequiredFeatures;

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

    if (signMessage) {
        const feature = findFeature(features, 'SignMessage');
        if (!feature) {
            return false;
        }

        if (!checkSignMessage(feature, signMessage)) {
            return false;
        }
    }

    if (embeddedRequest) {
        const feature = findFeature(features, 'EmbeddedRequest');
        if (!feature) {
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

    const correctItemTypes =
        !requiredFeature.itemTypes?.length ||
        (feature.itemTypes && requiredFeature.itemTypes.every(t => feature.itemTypes!.includes(t)));

    return !!(correctMessagesNumber && correctExtraCurrency && correctItemTypes);
}

function checkSignMessage(
    feature: SignMessageFeature,
    requiredFeature: RequiredSignMessageFeature
): boolean {
    const correctMessagesNumber =
        requiredFeature.minMessages === undefined ||
        requiredFeature.minMessages <= feature.maxMessages;

    const correctExtraCurrency =
        !requiredFeature.extraCurrencyRequired || feature.extraCurrencySupported;

    const correctItemTypes =
        !requiredFeature.itemTypes?.length ||
        (feature.itemTypes && requiredFeature.itemTypes.every(t => feature.itemTypes!.includes(t)));

    return !!(correctMessagesNumber && correctExtraCurrency && correctItemTypes);
}

function checkSignData(
    feature: SignDataFeature,
    requiredFeature: RequiredSignDataFeature
): boolean {
    return requiredFeature.types.every(requiredType => feature.types.includes(requiredType));
}
