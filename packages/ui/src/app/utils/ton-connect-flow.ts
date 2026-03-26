import {
    ITonConnect,
    ConnectAdditionalRequest,
    WalletSourceArg,
    WaleltIntentResult
} from '@tonconnect/sdk';
import { walletsModalState } from 'src/app/state/modals-state';

export async function initiateTonConnectFlow<TWallet extends WalletSourceArg>(
    connector: ITonConnect,
    walletSource: TWallet,
    options: { additionalRequest?: ConnectAdditionalRequest } = {}
): Promise<WaleltIntentResult<TWallet>> {
    const state = walletsModalState();

    if (state.mode === 'intent') {
        const intent = state.intent!;
        return await connector.subscribeToIntent(walletSource, intent, {
            traceId: state.traceId,
            connectRequest: options.additionalRequest
        });
    } else {
        return await connector.connect(walletSource, options.additionalRequest, {
            traceId: state.traceId
        });
    }
}
