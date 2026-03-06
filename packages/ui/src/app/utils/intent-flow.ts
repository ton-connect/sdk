import {
    ITonConnect,
    IntentOptions,
    OptionalTraceable,
    SendActionIntentRequest,
    SendTransactionIntentRequest,
    SignDataIntentRequest,
    SignMessageIntentRequest,
    ConnectAdditionalRequest,
    WalletSourceArg,
    WalletIntentResult
} from '@tonconnect/sdk';
import { IntentType } from 'src/models/wallets-modal';
import { TonConnectUIError } from 'src/errors';
import { walletsModalState } from 'src/app/state/modals-state';

/**
 * Starts intent flow for a given wallet and intent type.
 * For HTTP wallets returns an intent URL, for injected / WalletConnect may perform side effects and return void.
 */
export function startIntentFlow<TWallet extends WalletSourceArg>(
    connector: ITonConnect,
    walletSource: TWallet,
    intentType: IntentType,
    intent:
        | SendTransactionIntentRequest
        | SignDataIntentRequest
        | SignMessageIntentRequest
        | SendActionIntentRequest,
    options: OptionalTraceable<IntentOptions>
): WalletIntentResult<TWallet> {
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
            return connector.signDataIntent(walletSource, intent as SignDataIntentRequest, options);
        default:
            throw new TonConnectUIError(`Unsupported intent type ${intentType}`);
    }
}

export function initiateTonConnectFlow<TWallet extends WalletSourceArg>(
    connector: ITonConnect,
    walletSource: TWallet,
    options: { additionalRequest?: ConnectAdditionalRequest } = {}
): WalletIntentResult<TWallet> {
    const state = walletsModalState();

    if (state.mode === 'intent') {
        const intent = state.intent!;
        const intentType = state.intentType!;

        return startIntentFlow(connector, walletSource, intentType, intent, {
            traceId: state.traceId,
            connectRequest: options.additionalRequest
        });
    } else {
        return connector.connect(walletSource, options.additionalRequest, {
            traceId: state.traceId
        });
    }
}
