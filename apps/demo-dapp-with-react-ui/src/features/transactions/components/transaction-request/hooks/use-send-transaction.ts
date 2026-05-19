import { useCallback, useState } from 'react';
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';

import type { OperationResult } from '../../../lib/transaction-presets';
import { buildOutgoingMessages, type OutgoingMessage } from '../utils';

export interface SendPayload {
    /** Frozen request JSON kept as `requestSnapshot` in the result for replay. */
    snapshot: string;
    validUntil: number;
    messages: OutgoingMessage[];
}

/**
 * Owns send orchestration: invokes tonConnectUI.sendTransaction, snapshots the
 * request + response into `lastResult`, drives `isSending`. Knows nothing about
 * form state — callers pass exactly what to send.
 */
export function useSendTransaction() {
    const [tonConnectUI] = useTonConnectUI();
    const wallet = useTonWallet();

    const [isSending, setIsSending] = useState(false);
    const [lastResult, setLastResult] = useState<OperationResult | null>(null);

    const send = useCallback(
        async (payload: SendPayload) => {
            if (!wallet) return;
            setIsSending(true);
            try {
                const result = await tonConnectUI.sendTransaction({
                    validUntil: payload.validUntil,
                    messages: payload.messages
                });
                setLastResult({
                    id: crypto.randomUUID(),
                    timestamp: Date.now(),
                    requestSnapshot: payload.snapshot,
                    response: JSON.stringify(result, null, 2),
                    status: 'success',
                    boc: result.boc,
                    validUntil: payload.validUntil
                });
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Transaction failed';
                setLastResult({
                    id: crypto.randomUUID(),
                    timestamp: Date.now(),
                    requestSnapshot: payload.snapshot,
                    response: JSON.stringify({ error: message }, null, 2),
                    status: 'error',
                    errorMessage: message
                });
                console.error('sendTransaction failed', error);
            } finally {
                setIsSending(false);
            }
        },
        [tonConnectUI, wallet]
    );

    const sendRaw = useCallback(
        async (rawJson: string) => {
            if (!wallet) return;

            let data: { validUntil?: number; messages?: Record<string, string>[] };
            try {
                data = JSON.parse(rawJson);
            } catch (error) {
                const message = error instanceof Error ? error.message : 'Invalid JSON';
                setLastResult({
                    id: crypto.randomUUID(),
                    timestamp: Date.now(),
                    requestSnapshot: rawJson,
                    response: JSON.stringify({ error: message }, null, 2),
                    status: 'error',
                    errorMessage: message
                });
                return;
            }

            await send({
                snapshot: rawJson,
                validUntil: data.validUntil || Math.floor(Date.now() / 1000) + 300,
                messages: buildOutgoingMessages(data.messages ?? [])
            });
        },
        [send, wallet]
    );

    const clearResult = useCallback(() => setLastResult(null), []);

    return {
        send,
        sendRaw,
        isSending,
        lastResult,
        clearResult
    };
}
