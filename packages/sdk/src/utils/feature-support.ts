import { DecryptDataFeature, EncryptDataFeature, Feature, SendTransactionFeature } from '@tonconnect/protocol';
import { logWarning } from 'src/utils/log';
import { WalletNotSupportFeatureError } from 'src/errors/wallet/wallet-not-support-feature.error';

export function checkSendTransactionSupport(
    features: Feature[],
    options: { requiredMessagesNumber: number }
): never | void {
    const supportsDeprecatedSendTransactionFeature = features.includes('SendTransaction');
    const sendTransactionFeature = features.find(
        feature => feature && typeof feature === 'object' && feature.name === 'SendTransaction'
    ) as SendTransactionFeature;

    if (!supportsDeprecatedSendTransactionFeature && !sendTransactionFeature) {
        throw new WalletNotSupportFeatureError("Wallet doesn't support SendTransaction feature.");
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

export function checkEncryptDataSupport(
    features: Feature[],
    // options?: { requiredMessagesNumber: number }
): never | void {
    const encryptDataFeature = features.find(
        feature => feature && typeof feature === 'object' && feature.name === 'EncryptData'
    ) as EncryptDataFeature;

    if (!encryptDataFeature) {
        throw new WalletNotSupportFeatureError("Wallet doesn't support EncryptData feature.");
    }

    // if (encryptDataFeature && sendTransactionFeature.maxMessages !== undefined) {
    //     if (sendTransactionFeature.maxMessages < options.requiredMessagesNumber) {
    //         throw new WalletNotSupportFeatureError(
    //             `Wallet is not able to handle such SendTransaction request. Max support messages number is ${sendTransactionFeature.maxMessages}, but ${options.requiredMessagesNumber} is required.`
    //         );
    //     }
    //     return;
    // }

    logWarning(
        "Connected wallet didn't provide information about max allowed messages in the EncryptData request. Request may be rejected by the wallet."
    );
}

export function checkDecryptDataSupport(
    features: Feature[],
    // options?: { requiredMessagesNumber: number }
): never | void {
    const decryptDataFeature = features.find(
        feature => feature && typeof feature === 'object' && feature.name === 'DecryptData'
    ) as DecryptDataFeature;

    if (!decryptDataFeature) {
        throw new WalletNotSupportFeatureError("Wallet doesn't support DecryptData feature.");
    }

    // if (encryptDataFeature && sendTransactionFeature.maxMessages !== undefined) {
    //     if (sendTransactionFeature.maxMessages < options.requiredMessagesNumber) {
    //         throw new WalletNotSupportFeatureError(
    //             `Wallet is not able to handle such SendTransaction request. Max support messages number is ${sendTransactionFeature.maxMessages}, but ${options.requiredMessagesNumber} is required.`
    //         );
    //     }
    //     return;
    // }

    logWarning(
        "Connected wallet didn't provide information about max allowed messages in the DecryptData request. Request may be rejected by the wallet."
    );
}