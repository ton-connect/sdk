import { useCallback, useEffect, useMemo, useState } from 'react';
import {
    type SendTransactionRequest,
    type SignMessageRequest,
    useTonConnectUI,
    useTonWallet
} from '@tonconnect/ui-react';
import { Address } from '@ton/ton';

import { fail, ok, type OperationResult } from '../../../../../core/components/ui/result-block';

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

const serializeRequest = (request: BatchRequest): string => JSON.stringify(request, null, 2);

const parseDraft = (draft: string): BatchRequest | null => {
    try {
        const parsed = JSON.parse(draft);
        if (
            parsed &&
            typeof parsed === 'object' &&
            Array.isArray(parsed.messages) &&
            typeof parsed.validUntil === 'number'
        ) {
            return parsed as BatchRequest;
        }
        return null;
    } catch {
        return null;
    }
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

    const recipient = wallet?.account.address ? toFriendlyAddress(wallet.account.address) : '';

    const [mode, setMode] = useState<BatchMode>('sendTransaction');
    const [draft, setDraft] = useState(() =>
        serializeRequest(buildRequest(DEFAULT_COUNT, recipient))
    );
    const [sending, setSending] = useState(false);
    const [result, setResult] = useState<OperationResult | null>(null);

    // Regenerate the draft when the wallet address changes so the preset always
    // matches the active account. Wipes manual edits — acceptable since
    // switching accounts mid-edit is rare.
    useEffect(() => {
        setDraft(serializeRequest(buildRequest(DEFAULT_COUNT, recipient)));
    }, [recipient]);

    const parsed = useMemo(() => parseDraft(draft), [draft]);
    const isInvalid = parsed === null;
    const count = parsed?.messages?.length ?? 0;

    const setCount = useCallback(
        (next: number) => {
            setDraft(serializeRequest(buildRequest(next, recipient)));
        },
        [recipient]
    );

    const onDraftChange = useCallback((next: string) => setDraft(next), []);

    const reset = useCallback(() => {
        setMode('sendTransaction');
        setDraft(serializeRequest(buildRequest(DEFAULT_COUNT, recipient)));
    }, [recipient]);

    const send = useCallback(async () => {
        if (!wallet?.account || !parsed) return;

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
    }, [tonConnectUI, wallet, mode, parsed, count]);

    const clearResult = useCallback(() => setResult(null), []);

    return {
        mode,
        setMode,
        count,
        setCount,
        draft,
        onDraftChange,
        isInvalid,
        send,
        sending,
        result,
        clearResult,
        reset
    };
};
