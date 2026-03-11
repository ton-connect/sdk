import {
    ITonConnect,
    ConnectAdditionalRequest,
    WalletSourceArg,
    WaleltIntentResult
} from '@tonconnect/sdk';
import { walletsModalState } from 'src/app/state/modals-state';

export function initiateTonConnectFlow<TWallet extends WalletSourceArg>(
    connector: ITonConnect,
    walletSource: TWallet,
    options: { additionalRequest?: ConnectAdditionalRequest } = {}
): WaleltIntentResult<TWallet> {
    const state = walletsModalState();

    if (state.mode === 'intent') {
        const intent = state.intent!;

        switch (intent.method) {
            case 'sendTransaction':
                return connector.subscribeToSendTransactionIntent(walletSource, intent, {
                    traceId: state.traceId,
                    connectRequest: options.additionalRequest
                });
            case 'signData':
                return connector.subscribeToSignDataIntent(walletSource, intent, {
                    traceId: state.traceId,
                    connectRequest: options.additionalRequest
                });
            case 'signMessage':
                return connector.subscribeToSignMessageIntent(walletSource, intent, {
                    traceId: state.traceId,
                    connectRequest: options.additionalRequest
                });
            case 'sendAction':
                return connector.subscribeToSendActionIntent(walletSource, intent, {
                    traceId: state.traceId,
                    connectRequest: options.additionalRequest
                });
        }
    } else {
        return connector.connect(walletSource, options.additionalRequest, {
            traceId: state.traceId
        });
    }
}
