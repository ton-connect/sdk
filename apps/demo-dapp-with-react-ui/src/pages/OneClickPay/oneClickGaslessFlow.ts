import {
    Address,
    beginCell,
    Cell,
    external,
    loadMessageRelaxed,
    storeMessage,
    toNano
} from '@ton/core';
import { TonApiClient } from '@ton-api/client';
import { TonConnectUI } from '@tonconnect/ui-react';
import { retry } from '../../utils/retry';
import { waitForJettonTransferOnChain, JettonTransferMatch } from './waitForJettonTransferOnChain';

const ta = new TonApiClient({ baseUrl: 'https://tonapi.io' });

const BASE_JETTON_SEND_AMOUNT = toNano(0.05);

/** USDt jetton master on mainnet. */
export const USDT_MASTER = Address.parse('EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs');

export type PayStage =
    | { name: 'idle' }
    | { name: 'estimating' }
    | { name: 'signing' }
    | { name: 'submitting' }
    | { name: 'waiting-onchain'; pollsElapsedMs: number }
    | { name: 'confirmed'; onchain: JettonTransferMatch }
    | { name: 'error'; error: string };

export interface OneClickPayParams {
    /** Jetton master. Demo: USDT. */
    master: Address;
    /** Amount in elementary jetton units (USDT has 6 decimals → 1 USDT = 1_000_000). */
    amount: bigint;
    /** Recipient address. */
    destination: Address;
    /** How long to wait for the transfer to appear on-chain. */
    onChainTimeoutMs?: number;
    /** Progress callback. */
    onStage: (stage: PayStage) => void;
}

interface RelayEstimate {
    relayAddress: Address;
    providerAmount: string;
    providerDestination: string;
}

/**
 * Ask Tonkeeper's battery for the relay fee. Unlike TonAPI's
 * `gaslessEstimate`, this endpoint doesn't require the sender's address or
 * public key — so we can run it before the wallet is connected and fold the
 * full transfer into the embedded connect request.
 */
async function estimateRelayFee(params: OneClickPayParams): Promise<RelayEstimate> {
    const cfg = await ta.gasless.gaslessConfig();
    const relayAddress = cfg.relayAddress;

    const res = await fetch('https://battery.tonkeeper.com/gasless/estimate/jetton-transfer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            jetton_master: params.master.toString(),
            destination: params.destination.toString(),
            responseDestination: relayAddress.toString(),
            attached_ton: BASE_JETTON_SEND_AMOUNT.toString(),
            forward_ton_amount: '1'
        })
    });

    if (!res.ok) {
        throw new Error(`Gasless estimator failed (${res.status})`);
    }

    const body = await res.json();
    if (!body?.amount || !body?.destination) {
        throw new Error('Gasless estimator returned an unexpected payload');
    }

    return {
        relayAddress,
        providerAmount: String(body.amount),
        providerDestination: String(body.destination)
    };
}

/**
 * Thrown when `signMessage` returns `hasResponse: false`. Carries `dispatched` so the caller can
 * decide how to recover:
 *  - `dispatched: false` — the request never made it to the wallet; the user can safely click Pay
 *    again to send it over the bridge.
 *  - `dispatched: true` — the request rode along with the connect URL but no BoC came back. The
 *    wallet may have already signed (and the user may have already approved) the same transfer.
 *    The page should look the user in the eye before retrying: check the destination address
 *    on-chain for a matching transfer first, otherwise a retry can double-send.
 */
export class EmbeddedSignNoResponseError extends Error {
    constructor(public readonly dispatched: boolean) {
        super(
            dispatched
                ? 'Wallet connected but the signed message was not returned. The request was delivered inside the connect URL — the wallet may already have signed it. Verify the destination address on-chain before retrying.'
                : 'Wallet connected but the signed message was not returned. The request did not reach the wallet, so retrying is safe.'
        );
        this.name = 'EmbeddedSignNoResponseError';
    }
}

/**
 * One-click gasless USDT transfer with on-chain confirmation.
 *
 * The whole flow is driven by a single `signMessage` call:
 *
 *   1. Estimate the relay fee via Tonkeeper's battery endpoint. This doesn't
 *      need the sender's address, so it runs before the wallet is connected.
 *   2. Build a two-item structured request (user's transfer + relay-fee
 *      payment) and hand it to `signMessage` with `enableEmbeddedRequest: true`.
 *      If the wallet isn't connected, the SDK opens the connect modal with the
 *      request embedded in the URL; a compliant wallet handles both connect and
 *      sign in one round-trip. If the wallet connects but doesn't return a
 *      signed message, we throw `EmbeddedSignNoResponseError` so the page can
 *      ask the user how to recover — we deliberately do not auto-retry, because
 *      a `dispatched: true` request may have already been signed.
 *   3. Wrap the signed internal message in an external envelope and submit
 *      it via `gaslessSend` (with retry).
 *   4. Poll the sender's event history until the jetton-transfer action
 *      appears — that's when the transaction is truly on-chain.
 *
 * Docs: https://docs.tonconsole.com/tonapi/rest-api/gasless
 */
export async function oneClickGaslessPay(
    tonConnectUi: TonConnectUI,
    params: OneClickPayParams
): Promise<JettonTransferMatch> {
    // 1. Estimate the relay fee. No wallet needed — we can run this before
    //    the user picks a wallet, which keeps the modal-to-signature latency
    //    as small as possible.
    params.onStage({ name: 'estimating' });
    const { relayAddress, providerAmount, providerDestination } = await estimateRelayFee(params);

    // 2. Sign. With `enableEmbeddedRequest: true` the SDK opens the connect
    //    modal with the request folded into the URL when the wallet is not
    //    connected, and wraps the normal bridge flow in the same envelope when
    //    it is — so we get a uniform `{ hasResponse, ... }` result either way.
    params.onStage({ name: 'signing' });
    const signedAtSec = Math.floor(Date.now() / 1000);

    const signPayload = {
        validUntil: Math.ceil(Date.now() / 1000) + 5 * 60,
        items: [
            {
                type: 'jetton' as const,
                master: params.master.toString(),
                amount: (params.amount - BigInt(providerAmount)).toString(),
                destination: params.destination.toString(),
                responseDestination: relayAddress.toString(),
                attachAmount: BASE_JETTON_SEND_AMOUNT.toString(),
                forwardAmount: '1'
            },
            {
                type: 'jetton' as const,
                master: params.master.toString(),
                amount: providerAmount,
                destination: providerDestination,
                responseDestination: relayAddress.toString()
            }
        ]
    };

    const embedded = await tonConnectUi.signMessage(signPayload, {
        enableEmbeddedRequest: true
    });

    if (!embedded.hasResponse) {
        // No signed BoC came back. We deliberately don't retry here — the page-level UI
        // surfaces a retry button so the user can confirm, and on `dispatched: true` it
        // can also poll on-chain for the expected transfer before re-prompting the wallet.
        throw new EmbeddedSignNoResponseError(embedded.connectResult.dispatched);
    }
    const { internalBoc } = embedded.response;

    if (!tonConnectUi.wallet?.account?.publicKey) {
        throw new Error('Connected wallet has no public key — cannot submit via gasless relay');
    }

    const walletAddress = Address.parse(tonConnectUi.wallet.account.address);
    const walletPublicKey = tonConnectUi.wallet.account.publicKey;

    // 3. Wrap the signed internal message in an external envelope and send it
    //    through the gasless relay.
    params.onStage({ name: 'submitting' });

    const {
        info: { dest },
        body,
        init
    } = loadMessageRelaxed(Cell.fromBase64(internalBoc).beginParse());

    const extMessage = beginCell()
        .storeWritable(storeMessage(external({ to: dest as Address, init, body })))
        .endCell();

    await retry(
        () =>
            ta.gasless.gaslessSend({
                walletPublicKey,
                boc: extMessage
            }),
        { delay: 2000, retries: 5 }
    );

    // 4. Wait for the transfer to surface on-chain so the UI can link straight
    //    to Tonviewer.
    params.onStage({ name: 'waiting-onchain', pollsElapsedMs: 0 });

    const onchain = await waitForJettonTransferOnChain(
        ta,
        walletAddress,
        {
            destination: params.destination,
            master: params.master,
            amount: params.amount
        },
        {
            intervalMs: 2000,
            timeoutMs: params.onChainTimeoutMs ?? 180_000,
            sinceUnixSec: signedAtSec - 5,
            onTick: (_attempt, elapsedMs) => {
                params.onStage({ name: 'waiting-onchain', pollsElapsedMs: elapsedMs });
            }
        }
    );

    params.onStage({ name: 'confirmed', onchain });
    return onchain;
}
