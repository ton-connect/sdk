import { useCallback, useState } from 'react';
import type { SendTransactionRequest } from '@tonconnect/ui-react';

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
export const useTransactionForm = (buildInitial: () => SendTransactionRequest = buildDefaultTx) => {
    const {
        value: tx,
        draft,
        onDraftChange,
        replaceValue: replaceTx,
        isInvalid,
        isSendBlocked,
        showInvalidUi,
        showValidationUi,
        editorMessages,
        editorWarnings,
        validationErrors,
        validationWarnings
    } = useJsonDraftValidation({
        initialValue: buildInitial(),
        validate: (parsed, { nowSec }) => validateTransactionRequest(parsed, nowSec),
        watchTime: true
    });

    const [withConnect, setWithConnect] = useState(false);
    const [waitForTx, setWaitForTx] = useState(false);

    const validUntilError = showValidationUi
        ? validationErrors.find(message => message.startsWith('validUntil'))
        : undefined;
    const validUntilWarning = showValidationUi
        ? validationWarnings.find(message => message.startsWith('validUntil'))
        : undefined;

    const setValidUntil = useCallback(
        (nextValidUntil: number | undefined) => {
            replaceTx({
                ...tx,
                validUntil: nextValidUntil
            } as SendTransactionRequest);
        },
        [replaceTx, tx]
    );

    const setValidUntilFromNow = useCallback(
        (seconds: number) => setValidUntil(Math.floor(Date.now() / 1000) + seconds),
        [setValidUntil]
    );

    const reset = useCallback(() => {
        replaceTx(buildInitial());
        setWithConnect(false);
        setWaitForTx(false);
    }, [buildInitial, replaceTx]);

    return {
        tx,
        draft,
        isInvalid,
        isSendBlocked,
        showInvalidUi,
        editorMessages,
        editorWarnings,
        validUntilError,
        validUntilWarning,
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
