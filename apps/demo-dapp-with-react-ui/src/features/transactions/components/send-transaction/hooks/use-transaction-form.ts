import { useCallback, useState } from 'react';

import { useJsonDraftValidation } from '../../../../../core/hooks/use-json-draft-validation';
import { validateTransactionRequest } from '../../../../../core/utils/validation';
import { buildDefaultTx } from '../utils/transaction-presets';

export type RequestMode = 'send' | 'sign';

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
    const {
        value: tx,
        draft,
        onDraftChange,
        replaceValue: replaceTx,
        isInvalid,
        editorMessages,
        validationIssues
    } = useJsonDraftValidation({
        initialValue: buildDefaultTx(),
        validate: (parsed, { nowSec }) => validateTransactionRequest(parsed, nowSec),
        watchTime: true
    });

    const [withConnect, setWithConnect] = useState(false);
    const [waitForTx, setWaitForTx] = useState(false);

    const validUntilError = validationIssues.find(message => message.startsWith('validUntil'));

    const setValidUntil = useCallback(
        (nextValidUntil: number) => {
            replaceTx({ ...tx, validUntil: nextValidUntil });
        },
        [replaceTx, tx]
    );

    const setValidUntilFromNow = useCallback(
        (seconds: number) => setValidUntil(Math.floor(Date.now() / 1000) + seconds),
        [setValidUntil]
    );

    const reset = useCallback(() => {
        replaceTx(buildDefaultTx());
        setWithConnect(false);
        setWaitForTx(false);
    }, [replaceTx]);

    return {
        tx,
        draft,
        isInvalid,
        editorMessages,
        validUntilError,
        onDraftChange,
        replaceTx,
        setValidUntil,
        setValidUntilFromNow,
        reset,
        withConnect,
        setWithConnect,
        waitForTx,
        setWaitForTx,
        validUntil: tx.validUntil
    };
};
