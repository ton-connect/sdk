import { Feature, SendTransactionFeature } from '@tonconnect/protocol';
import { logWarning } from 'src/utils/log';
import { WalletNotSupportFeatureError } from 'src/errors/wallet/wallet-not-support-feature.error';
import { SendTransactionRequest } from 'src/models';

export function checkSendTransactionSupport(
    features: Feature[],
    options: { transaction: SendTransactionRequest }
): never | void {
    const requiredMessagesNumber = options.transaction.messages.length;
    const requiredExtraCurrencies = options.transaction.messages.some(
        message => message.extraCurrencies && Object.keys(message.extraCurrencies).length > 0
    );

    const supportsDeprecatedSendTransactionFeature = features.includes('SendTransaction');
    const sendTransactionFeature = features.find(
        feature => feature && typeof feature === 'object' && feature.name === 'SendTransaction'
    ) as SendTransactionFeature;

    if (!supportsDeprecatedSendTransactionFeature && !sendTransactionFeature) {
        throw new WalletNotSupportFeatureError("Wallet doesn't support SendTransaction feature.");
    }

    if (sendTransactionFeature && sendTransactionFeature.maxMessages !== undefined) {
        if (sendTransactionFeature.maxMessages < requiredMessagesNumber) {
            throw new WalletNotSupportFeatureError(
                `Wallet is not able to handle such SendTransaction request. Max support messages number is ${sendTransactionFeature.maxMessages}, but ${requiredMessagesNumber} is required.`
            );
        }
        return;
    }

    if (requiredExtraCurrencies && !sendTransactionFeature?.supportsExtraCurrencies) {
        throw new WalletNotSupportFeatureError(
            `Wallet is not able to handle such SendTransaction request. Wallet doesn't support extra currencies.`
        );
    }

    logWarning(
        "Connected wallet didn't provide information about max allowed messages in the SendTransaction request. Request may be rejected by the wallet."
    );
}
