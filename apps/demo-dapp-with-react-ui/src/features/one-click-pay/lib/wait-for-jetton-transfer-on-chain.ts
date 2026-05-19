import { Address } from '@ton/core';
import { TonApiClient } from '@ton-api/client';

export interface JettonTransferMatch {
    /** Event id (use with `https://tonviewer.com/transaction/<eventId>`). */
    eventId: string;
    /** Unix seconds of the block that contains the transaction. */
    timestamp: number;
    /** The account that received the jetton (matches `destination`). */
    recipient: string;
    /** Jetton amount (raw elementary units). */
    amount: string;
    /** Jetton master address of the transfer. */
    master: string;
}

interface WaitOptions {
    /** Poll every this many ms. */
    intervalMs: number;
    /** Give up after this many ms. */
    timeoutMs: number;
    /** Only consider events newer than this unix-seconds timestamp. */
    sinceUnixSec: number;
    /** Called on every poll with a human-readable status. */
    onTick?: (attempt: number, elapsedMs: number) => void;
}

/**
 * Poll the sender's wallet events looking for an outgoing JettonTransfer
 * that matches the given destination, jetton master and amount. Returns the
 * first match or throws on timeout.
 *
 * TonAPI indexes gasless transactions just like regular ones — once the
 * relayer broadcasts the external message and the TON network commits the
 * block, the jetton-transfer action appears in the sender's event history.
 */
export async function waitForJettonTransferOnChain(
    ta: TonApiClient,
    sender: Address,
    expected: {
        destination: Address;
        master: Address;
        amount: bigint;
    },
    options: WaitOptions
): Promise<JettonTransferMatch> {
    const started = Date.now();
    let attempt = 0;

    while (Date.now() - started < options.timeoutMs) {
        attempt++;
        options.onTick?.(attempt, Date.now() - started);

        try {
            const events = await ta.accounts.getAccountEvents(sender, {
                limit: 20,
                start_date: options.sinceUnixSec
            });

            for (const event of events.events) {
                if (event.timestamp < options.sinceUnixSec) {
                    continue;
                }

                for (const action of event.actions) {
                    if (action.type !== 'JettonTransfer' || !action.JettonTransfer) {
                        continue;
                    }
                    const jt = action.JettonTransfer;

                    const recipientOk = !!jt.recipient?.address?.equals(expected.destination);
                    const masterOk = !!jt.jetton?.address?.equals(expected.master);
                    const amountOk = BigInt(jt.amount) === expected.amount;

                    if (recipientOk && masterOk && amountOk) {
                        return {
                            eventId: event.eventId,
                            timestamp: event.timestamp,
                            recipient: jt.recipient!.address.toString(),
                            amount: jt.amount.toString(),
                            master: jt.jetton!.address.toString()
                        };
                    }
                }
            }
        } catch (err) {
            // TonAPI transient errors — swallow and retry next tick
            console.debug('[waitForJettonTransferOnChain] poll failed, retrying', err);
        }

        await sleep(options.intervalMs);
    }

    throw new Error(
        `Timed out after ${options.timeoutMs}ms waiting for jetton transfer to appear on-chain`
    );
}

function sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
}
