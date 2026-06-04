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
import {
    normalizeJsonValidation,
    type JsonValidationResult
} from '../../../../../core/utils/validation/validation-result';
import { validateTransactionRequest } from '../../../../../core/utils/validation';
import { DEMO_ECHO_ADDRESS } from '../../send-transaction/utils/transaction-presets';
import {
    BATCH_MESSAGE_COUNT_MAX,
    BATCH_MESSAGE_COUNT_WALLET_HINT,
    isBatchMessageCountCommittable
} from '../constants';

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

const defaultValidUntil = () => Math.floor(Date.now() / 1000) + VALID_UNTIL_SECONDS;

const clampMessageCount = (count: number): number =>
    Math.min(BATCH_MESSAGE_COUNT_MAX, Math.max(1, Math.floor(count)));

const buildRequest = (
    count: number,
    recipient: string,
    validUntil: number = defaultValidUntil()
): BatchRequest => {
    const safeCount = clampMessageCount(count);
    return {
        validUntil,
        messages: Array.from({ length: safeCount }, () => ({
            address: recipient,
            amount: PER_MESSAGE_AMOUNT_NANO
        }))
    };
};

const validateBatchRequest = (parsed: unknown, nowSec: number): JsonValidationResult => {
    const base = normalizeJsonValidation(validateTransactionRequest(parsed, nowSec));
    const messages = (parsed as BatchRequest | null)?.messages;
    const length = Array.isArray(messages) ? messages.length : 0;

    if (length > BATCH_MESSAGE_COUNT_MAX) {
        return {
            errors: [
                ...base.errors,
                `messages: count must be at most ${BATCH_MESSAGE_COUNT_MAX} (got ${length})`
            ],
            warnings: base.warnings
        };
    }

    if (length > BATCH_MESSAGE_COUNT_WALLET_HINT) {
        return {
            errors: base.errors,
            warnings: [
                ...base.warnings,
                `messages: ${length} exceeds maxMessages (${BATCH_MESSAGE_COUNT_WALLET_HINT}) on all known TON Connect wallets`
            ]
        };
    }

    return base;
};

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
        showInvalidUi,
        showValidationUi,
        editorMessages,
        editorWarnings,
        validationErrors,
        validationWarnings,
        isSyntaxInvalid
    } = useJsonDraftValidation({
        initialValue: buildRequest(DEFAULT_COUNT, recipient),
        validate: (parsed, { nowSec }) => validateBatchRequest(parsed, nowSec),
        watchTime: true
    });

    useEffect(() => {
        replaceValue(buildRequest(DEFAULT_COUNT, recipient));
    }, [recipient, replaceValue]);

    const parsed = isSyntaxInvalid ? null : requestValue;
    const count = parsed?.messages?.length ?? 0;
    const validUntil = parsed?.validUntil;

    const validUntilError = showValidationUi
        ? validationErrors.find(message => message.startsWith('validUntil'))
        : undefined;
    const validUntilWarning = showValidationUi
        ? validationWarnings.find(message => message.startsWith('validUntil'))
        : undefined;

    const countError =
        count > BATCH_MESSAGE_COUNT_MAX
            ? `Must be at most ${BATCH_MESSAGE_COUNT_MAX}`
            : count < 1 && showValidationUi
              ? 'Must be at least 1'
              : undefined;
    const countWarning =
        count > BATCH_MESSAGE_COUNT_WALLET_HINT && count <= BATCH_MESSAGE_COUNT_MAX
            ? `Exceeds maxMessages (${BATCH_MESSAGE_COUNT_WALLET_HINT}) on all known TON Connect wallets`
            : undefined;
    const isCountBlocked = !isBatchMessageCountCommittable(count);

    const setCount = useCallback(
        (next: number) => {
            if (!isBatchMessageCountCommittable(next)) {
                return;
            }
            replaceValue(buildRequest(next, recipient, parsed?.validUntil ?? defaultValidUntil()));
        },
        [replaceValue, recipient, parsed?.validUntil]
    );

    const setValidUntil = useCallback(
        (nextValidUntil: number | undefined) => {
            const base = parsed ?? buildRequest(count > 0 ? count : DEFAULT_COUNT, recipient);
            replaceValue({
                ...base,
                validUntil: nextValidUntil
            } as BatchRequest);
        },
        [parsed, count, recipient, replaceValue]
    );

    const setValidUntilFromNow = useCallback(
        (seconds: number) => setValidUntil(Math.floor(Date.now() / 1000) + seconds),
        [setValidUntil]
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
        countError,
        countWarning,
        isCountBlocked,
        validUntil,
        setValidUntil,
        setValidUntilFromNow,
        validUntilError,
        validUntilWarning,
        draft,
        onDraftChange,
        applyRequestContext,
        isInvalid,
        showInvalidUi,
        editorMessages,
        editorWarnings,
        send,
        sending,
        result,
        clearResult,
        reset
    };
};
