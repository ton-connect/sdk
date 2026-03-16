import {
    Feature,
    IntentsFeature,
    SendTransactionDraftFeature,
    SendTransactionFeature,
    SignDataFeature,
    SignMessageDraftFeature,
    ActionDraftFeature
} from '@tonconnect/protocol';
import { logWarning } from 'src/utils/log';
import { WalletNotSupportFeatureError } from 'src/errors/wallet';
import {
    RequiredFeatures,
    RequiredSendTransactionFeature,
    RequiredSignDataFeature,
    RequiredSignMessageFeature,
    RequiredSendTransactionDraftFeature,
    RequiredSignMessageDraftFeature,
    RequiredSendActionDraftFeature,
    RequiredIntentsFeature
} from 'src/models';

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

export function checkRequiredWalletFeatures(
    features: Feature[],
    walletsRequiredFeatures?: RequiredFeatures
): boolean {
    if (typeof walletsRequiredFeatures !== 'object') {
        return true;
    }

    const checks = [
        () => checkSendTransactionFeature(features, walletsRequiredFeatures.sendTransaction),
        () => checkSignMessageFeature(features, walletsRequiredFeatures.signMessage),
        () => checkSignDataFeature(features, walletsRequiredFeatures.signData),
        () =>
            checkSendTransactionDraftFeature(
                features,
                walletsRequiredFeatures.sendTransactionDraft
            ),
        () => checkSignMessageDraftFeature(features, walletsRequiredFeatures.signMessageDraft),
        () => checkSendActionDraftFeature(features, walletsRequiredFeatures.sendActionDraft),
        () => checkIntentsFeature(features, walletsRequiredFeatures.intents)
    ];

    return checks.every(check => check());
}

function checkSendTransactionFeature(
    features: Feature[],
    required?: RequiredSendTransactionFeature
): boolean {
    if (!required) return true;
    const feature = findFeature(features, 'SendTransaction');
    return !!feature && checkSendTransaction(feature, required);
}

function checkSignMessageFeature(
    features: Feature[],
    required?: RequiredSignMessageFeature
): boolean {
    if (!required) return true;
    return features.some(f => f && typeof f === 'object' && f.name === 'SignMessage');
}

function checkSignDataFeature(features: Feature[], required?: RequiredSignDataFeature): boolean {
    if (!required) return true;
    const feature = findFeature(features, 'SignData');
    return !!feature && checkSignData(feature, required);
}

function checkSendTransactionDraftFeature(
    features: Feature[],
    required?: RequiredSendTransactionDraftFeature
): boolean {
    if (!required) return true;
    const feature = findFeature(features, 'SendTransactionDraft') as
        | SendTransactionDraftFeature
        | undefined;
    return !!feature && checkSendTransactionDraft(feature, required);
}

function checkSignMessageDraftFeature(
    features: Feature[],
    required?: RequiredSignMessageDraftFeature
): boolean {
    if (!required) return true;
    const feature = findFeature(features, 'SignMessageDraft') as
        | SignMessageDraftFeature
        | undefined;
    return !!feature && checkSignMessageDraft(feature, required);
}

function checkSendActionDraftFeature(
    features: Feature[],
    required?: RequiredSendActionDraftFeature
): boolean {
    if (!required) return true;
    const feature = findFeature(features, 'ActionDraft') as ActionDraftFeature | undefined;
    return !!feature;
}

function checkIntentsFeature(features: Feature[], required?: RequiredIntentsFeature): boolean {
    if (!required) return true;
    const feature = findFeature(features, 'Intents') as IntentsFeature | undefined;
    return !!feature && required.types.every(type => feature.types.includes(type));
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

function checkSendTransactionDraft(
    feature: SendTransactionDraftFeature,
    requiredFeature: RequiredSendTransactionDraftFeature
): boolean {
    const correctTypes =
        requiredFeature.types === undefined ||
        requiredFeature.types.every(requiredType => feature.types.includes(requiredType));

    const correctMessagesNumber =
        requiredFeature.minMessages === undefined ||
        ('maxMessages' in feature &&
            typeof (feature as { maxMessages?: number }).maxMessages === 'number' &&
            requiredFeature.minMessages <= (feature as { maxMessages: number }).maxMessages);

    const correctExtraCurrency =
        !requiredFeature.extraCurrencyRequired ||
        ('extraCurrencySupported' in feature &&
            (feature as { extraCurrencySupported?: boolean }).extraCurrencySupported);

    return !!(correctTypes && correctMessagesNumber && correctExtraCurrency);
}

function checkSignMessageDraft(
    feature: SignMessageDraftFeature,
    requiredFeature: RequiredSignMessageDraftFeature
): boolean {
    const correctTypes =
        requiredFeature.types === undefined ||
        requiredFeature.types.every(requiredType => feature.types.includes(requiredType));

    const correctMessagesNumber =
        requiredFeature.minMessages === undefined ||
        ('maxMessages' in feature &&
            typeof (feature as { maxMessages?: number }).maxMessages === 'number' &&
            requiredFeature.minMessages <= (feature as { maxMessages: number }).maxMessages);

    const correctExtraCurrency =
        !requiredFeature.extraCurrencyRequired ||
        ('extraCurrencySupported' in feature &&
            (feature as { extraCurrencySupported?: boolean }).extraCurrencySupported);

    return !!(correctTypes && correctMessagesNumber && correctExtraCurrency);
}
