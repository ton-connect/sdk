import type { SendTransactionRequest } from '@tonconnect/ui-react';
import type { TonConnectUI } from '@tonconnect/ui-react';

export async function dispatchTransfer(
    tonConnectUi: TonConnectUI,
    tx: SendTransactionRequest,
    withConnect: boolean
) {
    if (withConnect) {
        const embedded = await tonConnectUi.sendTransaction(tx, {
            enableEmbeddedRequest: true
        });
        if (!embedded.hasResponse) {
            return { ok: false as const, dispatched: embedded.connectResult.dispatched };
        }
        return { ok: true as const, response: embedded.response };
    }

    const response = await tonConnectUi.sendTransaction(tx);
    return { ok: true as const, response };
}

export function embeddedTransferFailure(dispatched: boolean) {
    return {
        error:
            dispatched === true
                ? 'Connect succeeded but no transaction response. Check your wallet before retrying.'
                : 'Wallet connected but the transfer was not delivered. Safe to retry.'
    };
}
