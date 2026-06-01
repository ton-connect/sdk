import type { SignMessageRequest, TonConnectUI } from '@tonconnect/ui-react';

export class GaslessSignError extends Error {
    constructor(
        message: string,
        readonly dispatched = false
    ) {
        super(message);
        this.name = 'GaslessSignError';
    }
}

export async function signGaslessRequest(
    tonConnectUi: TonConnectUI,
    request: SignMessageRequest,
    withConnect: boolean
): Promise<{ internalBoc: string }> {
    if (withConnect) {
        const embedded = await tonConnectUi.signMessage(request, {
            enableEmbeddedRequest: true
        });
        if (!embedded.hasResponse) {
            throw new GaslessSignError(
                embedded.connectResult.dispatched
                    ? 'Wallet connected but the gasless request was not signed. Check your wallet before retrying.'
                    : 'Wallet connected but signing was not delivered. Safe to retry.',
                embedded.connectResult.dispatched
            );
        }
        return embedded.response;
    }

    return tonConnectUi.signMessage(request);
}
