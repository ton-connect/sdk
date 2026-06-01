import { beginCell, toNano } from '@ton/core';
import { SendTransactionRequest, TonConnectUI } from '@tonconnect/ui-react';

/**
 * Echo contract used across the demo dApp: it sends the received value straight
 * back to the sender, so this purchase flow can be run repeatedly without
 * actually spending TON. Perfect for a payment demo.
 */
export const ECHO_CONTRACT = 'EQCKWpx7cNMpvmcN5ObM5lLUZHZRFKqYA4xmw9jOry0ZsF9M';

// Optional "Hello!" comment body + state-init, mirroring the canonical
// EchoContract example in the TxForm demo.
const COMMENT_BODY = beginCell()
    .storeUint(0, 32)
    .storeStringTail('Scared Cat #742')
    .endCell()
    .toBoc()
    .toString('base64');

const ECHO_STATE_INIT =
    'te6cckEBBAEAOgACATQCAQAAART/APSkE/S88sgLAwBI0wHQ0wMBcbCRW+D6QDBwgBDIywVYzxYh+gLLagHPFsmAQPsAlxCarA==';

/** Demo price for the cat, in TON. */
export const PRICE_TON = '100';
export const PRICE_TON_NANO = toNano('1').toString();

export type PayStage =
    | { name: 'idle' }
    | { name: 'awaiting' }
    | { name: 'confirmed'; boc: string }
    | { name: 'dispatched' }
    | { name: 'error'; error: string };

export interface PayParams {
    amountNano: string;
    onStage: (stage: PayStage) => void;
}

/**
 * One-tap TON payment via an **embedded request** — no prior wallet connection.
 *
 * `sendTransaction(tx, { enableEmbeddedRequest: true })` folds the whole transfer
 * into the connect URL when the wallet is not connected, so a compliant wallet
 * handles connect + sign + send in a single round-trip. The point of this demo:
 * the user never has to press "Connect" first.
 *
 *  - `{ hasResponse: true, response }` — the wallet signed and submitted the tx.
 *  - `{ hasResponse: false, connectResult: { dispatched } }` — connected but no
 *    signed BoC came back. We never retry silently:
 *      - `dispatched: false` → request never reached the wallet; safe to retry.
 *      - `dispatched: true`  → the request rode along inside the connect URL and
 *        may already be signed; the UI must ask the user before retrying.
 */
export async function embeddedTonPay(ui: TonConnectUI, params: PayParams): Promise<void> {
    params.onStage({ name: 'awaiting' });

    const embedded = await ui.sendTransaction(
        {
            validUntil: Math.floor(Date.now() / 1000) + 6 * 60,
            messages: [
                {
                    address: ECHO_CONTRACT,
                    amount: params.amountNano,
                    payload: COMMENT_BODY,
                    stateInit: ECHO_STATE_INIT
                }
            ]
        } satisfies SendTransactionRequest,
        { enableEmbeddedRequest: true }
    );

    if (!embedded.hasResponse) {
        if (embedded.connectResult.dispatched) {
            params.onStage({ name: 'dispatched' });
            return;
        }
        throw new Error('The request never reached the wallet — you can safely try again.');
    }

    params.onStage({ name: 'confirmed', boc: embedded.response.boc });
}
