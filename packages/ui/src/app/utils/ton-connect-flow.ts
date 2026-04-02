import {
    ITonConnect,
    ConnectAdditionalRequest,
    WalletSourceArg,
    WalletIntentResult
} from '@tonconnect/sdk';
import { walletsModalState } from 'src/app/state/modals-state';
import { widgetController } from 'src/app/widget-controller';

export async function initiateTonConnectFlow<TWallet extends WalletSourceArg>(
    connector: ITonConnect,
    walletSource: TWallet,
    options: { additionalRequest?: ConnectAdditionalRequest } = {}
): Promise<WalletIntentResult<TWallet>> {
    const state = walletsModalState();

    if (state.mode === 'intent') {
        try {
            const intent = state.intent!;
            return await connector.subscribeToIntent(walletSource, intent, {
                traceId: state.traceId,
                connectRequest: state.noConnect ? undefined : options.additionalRequest
            });
        } catch (error) {
            widgetController.closeWalletsModal('action-cancelled');
            throw error;
        }
    } else {
        return connector.connect(walletSource, options.additionalRequest, {
            traceId: state.traceId
        });
    }
}
