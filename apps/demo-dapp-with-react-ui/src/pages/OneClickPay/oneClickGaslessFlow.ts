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
 * One-click gasless USDT transfer with on-chain confirmation.
 *
 * The whole flow is driven by a single `signMessage` call:
 *
 *   1. Estimate the relay fee via Tonkeeper's battery endpoint. This doesn't
 *      need the sender's address, so it runs before the wallet is connected.
 *   2. Build a two-item structured request (user's transfer + relay-fee
 *      payment) and hand it to `signMessage`. If the wallet isn't connected,
 *      the SDK opens the connect modal with the request embedded in the URL;
 *      a compliant wallet handles both connect and sign in one round-trip.
 *      Otherwise, `onConnected` fires as a fallback and we ship the request
 *      over the bridge.
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

    // 2. Sign. signMessage handles both "already connected" and "not yet
    //    connected" cases: if not connected, the SDK opens the modal with the
    //    request embedded in the connect URL. A wallet that understands
    //    embedded requests signs it together with connect; otherwise
    //    `onConnected` fires and we ship the request over the bridge.
    params.onStage({ name: 'signing' });
    const signedAtSec = Math.floor(Date.now() / 1000);

    const { internalBoc } = await tonConnectUi.signMessage(
        {
            validUntil: Math.ceil(Date.now() / 1000) + 5 * 60,
            items: [
                {
                    type: 'jetton',
                    master: params.master.toString(),
                    amount: params.amount.toString(),
                    destination: params.destination.toString(),
                    responseDestination: relayAddress.toString(),
                    attachAmount: BASE_JETTON_SEND_AMOUNT.toString(),
                    forwardAmount: '1'
                },
                {
                    type: 'jetton',
                    master: params.master.toString(),
                    amount: providerAmount,
                    destination: providerDestination,
                    responseDestination: relayAddress.toString()
                }
            ]
        },
        {
            // Fallback path: only reached when the wallet didn't fold the
            // embedded request into connect. `send()` ships the same request
            // over the bridge. When the wallet *did* handle it at connect
            // time, the SDK short-circuits and this callback never fires.
            onConnected: send => send()
        }
    );

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
