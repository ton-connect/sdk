import {
    ITonConnect,
    ConnectAdditionalRequest,
    WalletSourceArg,
    WalletIntentResult
} from '@tonconnect/sdk';
import { walletsModalState } from 'src/app/state/modals-state';

export function initiateTonConnectFlow<TWallet extends WalletSourceArg>(
    connector: ITonConnect,
    walletSource: TWallet,
    options: { additionalRequest?: ConnectAdditionalRequest } = {}
): WalletIntentResult<TWallet> {
    const state = walletsModalState();

    if (state.mode === 'intent') {
        const intent = state.intent!;

        return connector.subscribeToIntent(walletSource, intent, {
            traceId: state.traceId,
            connectRequest: options.additionalRequest
        });
    } else {
        return connector.connect(walletSource, options.additionalRequest, {
            traceId: state.traceId
        });
    }
}
