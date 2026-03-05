import {
    ITonConnect,
    IntentUrlOptions,
    OptionalTraceable,
    SendActionIntentRequest,
    SendTransactionIntentRequest,
    SignDataIntentRequest,
    SignMessageIntentRequest,
    WalletConnectionSource,
    WalletConnectionSourceHTTP,
    ConnectAdditionalRequest,
    WalletConnectionSourceJS,
    WalletConnectionSourceWalletConnect
} from '@tonconnect/sdk';
import { IntentType } from 'src/models/wallets-modal';
import { TonConnectUIError } from 'src/errors';
import { walletsModalState } from 'src/app/state/modals-state';

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
            return connector.signDataIntent(walletSource, intent as SignDataIntentRequest, options);
        default:
            throw new TonConnectUIError(`Unsupported intent type ${intentType}`);
    }
}

// TODO: move
export function initiateTonConnectFlow<
    TWallet extends WalletConnectionSource | Pick<WalletConnectionSourceHTTP, 'bridgeUrl'>[]
>(
    connector: ITonConnect,
    walletSource: TWallet,
    options: { additionalRequest?: ConnectAdditionalRequest } = {}
): TWallet extends WalletConnectionSourceJS
    ? void
    : TWallet extends WalletConnectionSourceWalletConnect
      ? void
      : string {
    const state = walletsModalState();

    if (state.mode === 'intent') {
        const intent = state.intent!;
        const intentType = state.intentType!;

        return startIntentFlow(connector, walletSource, intentType, intent, {
            traceId: state.traceId,
            connectRequest: options.additionalRequest
        }) as ReturnType<typeof initiateTonConnectFlow<TWallet>>; // TODO fix
    } else {
        return connector.connect(walletSource, options.additionalRequest, {
            traceId: state.traceId
        });
    }
}
