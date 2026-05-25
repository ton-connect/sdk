import { useCallback, useState } from 'react';
import {
    type SignDataPayload,
    type SignDataResponse,
    useTonConnectUI,
    useTonWallet
} from '@tonconnect/ui-react';

import { fail, ok, type OperationResult } from '../../../../../core/components/shared/result-block';
import { TonProofApi } from '../../../../../core/utils/ton-proof-demo-api';

/**
 * Embedded-request retry signal: connect happened, but no signature came back.
 * `dispatched: true` means the wallet may have already signed the payload —
 * surface a manual retry button rather than auto-retrying.
 */
export type RetryPrompt = { dispatched: boolean };

interface SendOptions {
    withConnect: boolean;
}

/**
 * Orchestrates `tonConnectUi.signData` + the demo-backend verification call.
 * Captures `{ response, verification }` (or error) into a `result` for the
 * page to render via ResultBlock. Surfaces a `retryPrompt` when the embedded
 * path returns no response.
 */
export const useSignData = () => {
    const [tonConnectUi] = useTonConnectUI();
    const wallet = useTonWallet();

    const [sending, setSending] = useState(false);
    const [result, setResult] = useState<OperationResult | null>(null);
    const [retryPrompt, setRetryPrompt] = useState<RetryPrompt | null>(null);

    const send = useCallback(
        async (payload: SignDataPayload, opts: SendOptions) => {
            setResult(null);
            setRetryPrompt(null);
            setSending(true);

            try {
                let response: SignDataResponse;
                if (opts.withConnect) {
                    const embedded = await tonConnectUi.signData(payload, {
                        enableEmbeddedRequest: true
                    });
                    if (!embedded.hasResponse) {
                        setRetryPrompt({ dispatched: embedded.connectResult.dispatched });
                        return;
                    }
                    response = embedded.response;
                } else {
                    response = await tonConnectUi.signData(payload);
                }

                const verification = wallet
                    ? await TonProofApi.checkSignData(response, wallet.account)
                    : null;

                setResult(ok({ response, verification }));
            } catch (error) {
                console.error('signData failed', error);
                setResult(fail(error));
            } finally {
                setSending(false);
            }
        },
        [tonConnectUi, wallet]
    );

    const dismissRetryPrompt = useCallback(() => setRetryPrompt(null), []);
    const clearResult = useCallback(() => setResult(null), []);

    return {
        send,
        sending,
        result,
        clearResult,
        retryPrompt,
        dismissRetryPrompt
    };
};
