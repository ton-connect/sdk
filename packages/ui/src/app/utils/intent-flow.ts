import {
    ITonConnect,
    IntentUrlOptions,
    OptionalTraceable,
    SendActionIntentRequest,
    SendTransactionIntentRequest,
    SignDataIntentRequest,
    SignMessageIntentRequest,
    WalletConnectionSource,
    WalletConnectionSourceHTTP
} from '@tonconnect/sdk';
import { IntentType } from 'src/models/wallets-modal';

type IntentOptions = OptionalTraceable<IntentUrlOptions>;

type WalletSource = WalletConnectionSource | Pick<WalletConnectionSourceHTTP, 'bridgeUrl'>[];

/**
 * Starts intent flow for a given wallet and intent type.
 * For HTTP wallets returns an intent URL, for injected / WalletConnect may perform side effects and return void.
 */
export function startIntentFlow(
    connector: ITonConnect,
    walletSource: WalletSource,
    intentType: IntentType,
    intent:
        | SendTransactionIntentRequest
        | SignDataIntentRequest
        | SignMessageIntentRequest
        | SendActionIntentRequest,
    options: IntentOptions
): string | void {
    switch (intentType) {
        case 'sendTransaction':
            return connector.sendTransactionIntent(
                walletSource,
                intent as SendTransactionIntentRequest,
                options
            );
        case 'signMessage':
            return connector.signMessageIntent(
                walletSource,
                intent as SignMessageIntentRequest,
                options
            );
        case 'sendAction':
            return connector.sendActionIntent(
                walletSource,
                intent as SendActionIntentRequest,
                options
            );
        case 'signData':
        default:
            return connector.signDataIntent(walletSource, intent as SignDataIntentRequest, options);
    }
}
