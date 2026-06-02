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

export interface PayResult {
    /** Signed BoC, or null when the wallet connected but returned no signature. */
    boc: string | null;
    /** True when the request rode along inside the connect link but no signature came back. */
    dispatched: boolean;
}

/**
 * One-tap TON payment via an **embedded request** — no prior wallet connection.
 *
 * `sendTransaction(tx, { enableEmbeddedRequest: true })` folds the whole transfer
 * into the connect URL when the wallet is not connected, so a compliant wallet
 * handles connect + sign + send in a single round-trip. Returns the signed BoC
 * (or `dispatched: true` when the wallet connected but returned nothing) — the
 * page drives its own loader stages.
 */
export async function embeddedTonPay(ui: TonConnectUI, amountNano: string): Promise<PayResult> {
    const embedded = await ui.sendTransaction(
        {
            validUntil: Math.floor(Date.now() / 1000) + 6 * 60,
            messages: [
                {
                    address: ECHO_CONTRACT,
                    amount: amountNano,
                    payload: COMMENT_BODY,
                    stateInit: ECHO_STATE_INIT
                }
            ]
        } satisfies SendTransactionRequest,
        { enableEmbeddedRequest: true }
    );

    if (!embedded.hasResponse) {
        if (embedded.connectResult.dispatched) {
            return { boc: null, dispatched: true };
        }
        throw new Error('The request never reached the wallet — you can safely try again.');
    }

    return { boc: embedded.response.boc, dispatched: false };
}
