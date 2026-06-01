import { useCallback, useEffect, useState } from 'react';
import {
    type SendTransactionRequest,
    type SignMessageRequest,
    useTonConnectUI,
    useTonWallet
} from '@tonconnect/ui-react';
import { Address } from '@ton/ton';

import { useJsonDraftValidation } from '../../../../../core/hooks/use-json-draft-validation';
import { fail, ok, type OperationResult } from '../../../../../core/components/shared/result-block';
import {
    mergeRequestContext,
    type RequestContextPatch
} from '../../../../../core/utils/merge-request-context';
import { validateTransactionRequest } from '../../../../../core/utils/validation';
import { DEMO_ECHO_ADDRESS } from '../../send-transaction/utils/transaction-presets';

export type BatchMode = 'sendTransaction' | 'signMessage';

const PER_MESSAGE_AMOUNT_NANO = '10000';
const VALID_UNTIL_SECONDS = 600;
const DEFAULT_COUNT = 4;

const toFriendlyAddress = (raw: string): string => {
    try {
        return Address.parse(raw).toString({ urlSafe: true, bounceable: false });
    } catch {
        return raw;
    }
};

type BatchRequest = SendTransactionRequest & SignMessageRequest;

const buildRequest = (count: number, recipient: string): BatchRequest => ({
    validUntil: Math.floor(Date.now() / 1000) + VALID_UNTIL_SECONDS,
    messages: Array.from({ length: count }, () => ({
        address: recipient,
        amount: PER_MESSAGE_AMOUNT_NANO
    }))
});

/**
 * Owns the batch-limits probe state. The JsonEditor `draft` is the source of
 * truth at send time — mode/count act as presets that regenerate the draft.
 * `count` is derived from the parsed draft so editing the JSON updates the
 * displayed count; an invalid draft surfaces via `isInvalid` and blocks send.
 */
export const useBatchTester = () => {
    const wallet = useTonWallet();
    const [tonConnectUI] = useTonConnectUI();

    const recipient = wallet?.account.address
        ? toFriendlyAddress(wallet.account.address)
        : DEMO_ECHO_ADDRESS;

    const [mode, setMode] = useState<BatchMode>('sendTransaction');
    const [sending, setSending] = useState(false);
    const [result, setResult] = useState<OperationResult | null>(null);

    const {
        value: requestValue,
        draft,
        onDraftChange,
        replaceValue,
        isInvalid,
        editorMessages,
        isSyntaxInvalid
    } = useJsonDraftValidation({
        initialValue: buildRequest(DEFAULT_COUNT, recipient),
        validate: (parsed, { nowSec }) => validateTransactionRequest(parsed, nowSec),
        watchTime: true
    });

    useEffect(() => {
        replaceValue(buildRequest(DEFAULT_COUNT, recipient));
    }, [recipient, replaceValue]);

    const parsed = isSyntaxInvalid ? null : requestValue;
    const count = parsed?.messages?.length ?? 0;

    const setCount = useCallback(
        (next: number) => {
            replaceValue(buildRequest(next, recipient));
        },
        [replaceValue, recipient]
    );

    const applyRequestContext = useCallback(
        (patch: RequestContextPatch) => {
            const base = parsed ?? buildRequest(count > 0 ? count : DEFAULT_COUNT, recipient);
            replaceValue(mergeRequestContext(base, patch));
        },
        [parsed, recipient, count, replaceValue]
    );

    const reset = useCallback(() => {
        setMode('sendTransaction');
        replaceValue(buildRequest(DEFAULT_COUNT, recipient));
    }, [replaceValue, recipient]);

    const send = useCallback(async () => {
        if (!wallet?.account || !parsed || isInvalid) return;

        setResult(null);
        setSending(true);

        try {
            const response =
                mode === 'sendTransaction'
                    ? await tonConnectUI.sendTransaction(parsed)
                    : await tonConnectUI.signMessage(parsed);
            setResult(ok(response));
        } catch (error) {
            console.error(`${mode} with ${count} messages failed`, error);
            setResult(fail(error));
        } finally {
            setSending(false);
        }
    }, [tonConnectUI, wallet, mode, parsed, count, isInvalid]);

    const clearResult = useCallback(() => setResult(null), []);

    return {
        mode,
        setMode,
        count,
        setCount,
        draft,
        onDraftChange,
        applyRequestContext,
        isInvalid,
        editorMessages,
        send,
        sending,
        result,
        clearResult,
        reset
    };
};
