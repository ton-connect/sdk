import { useCallback, useState } from 'react';
import type { SendTransactionRequest } from '@tonconnect/ui-react';

import { buildDefaultTx } from '../utils/transaction-presets';

export type RequestMode = 'send' | 'sign';

const stringify = (value: SendTransactionRequest): string => JSON.stringify(value, null, 2);

/**
 * Holds the transaction-request as a parsed object (single source of truth) plus
 * a string buffer that backs the JSON editor for in-flight typing. Form-side
 * mutations rewrite both. Editor-side input updates the buffer and re-parses on
 * each keystroke; an invalid parse keeps the object intact but flags `isInvalid`.
 *
 * Also owns the two flags that wrap the wallet call: `withConnect` (embed the
 * request in the connect URL) and `waitForTx` (poll on-chain after send).
 */
export const useTransactionForm = () => {
    const [tx, setTx] = useState<SendTransactionRequest>(buildDefaultTx);
    const [draft, setDraft] = useState<string>(() => stringify(tx));
    const [isInvalid, setIsInvalid] = useState(false);

    const [withConnect, setWithConnect] = useState(false);
    const [waitForTx, setWaitForTx] = useState(false);

    /** Replace the whole tx (preset load, reset). Buffer follows. */
    const replaceTx = useCallback((next: SendTransactionRequest) => {
        setTx(next);
        setDraft(stringify(next));
        setIsInvalid(false);
    }, []);

    /** Editor change: update buffer, re-parse, swap `tx` if the JSON is valid. */
    const onDraftChange = useCallback((next: string) => {
        setDraft(next);
        try {
            const parsed = JSON.parse(next);
            if (parsed && typeof parsed === 'object') {
                setTx(parsed as SendTransactionRequest);
                setIsInvalid(false);
            } else {
                setIsInvalid(true);
            }
        } catch {
            setIsInvalid(true);
        }
    }, []);

    /** Form-side mutator for `validUntil`. Rewrites both the object and the buffer. */
    const setValidUntil = useCallback((nextValidUntil: number) => {
        setTx(prev => {
            const next = { ...prev, validUntil: nextValidUntil };
            setDraft(stringify(next));
            setIsInvalid(false);
            return next;
        });
    }, []);

    const setValidUntilFromNow = useCallback(
        (seconds: number) => setValidUntil(Math.floor(Date.now() / 1000) + seconds),
        [setValidUntil]
    );

    const reset = useCallback(() => {
        const fresh = buildDefaultTx();
        replaceTx(fresh);
        setWithConnect(false);
        setWaitForTx(false);
    }, [replaceTx]);

    return {
        tx,
        draft,
        isInvalid,
        onDraftChange,
        replaceTx,
        setValidUntil,
        setValidUntilFromNow,
        reset,
        withConnect,
        setWithConnect,
        waitForTx,
        setWaitForTx,
        // derived
        validUntil: tx.validUntil
    };
};
