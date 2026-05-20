import { useCallback, useState } from 'react';
import {
    CHAIN,
    type SendTransactionRequest,
    useTonConnectUI,
    useTonWallet
} from '@tonconnect/ui-react';

import { TonProofDemoApi } from '../../../../../core/lib/ton-proof-demo-api';

/**
 * A completed (or failed) send/sign attempt — what ResultBlock renders.
 * `response` is the pre-stringified payload shown in the JsonView.
 */
export interface OperationResult {
    status: 'success' | 'error';
    response: string;
}

/**
 * When `enableEmbeddedRequest: true` returns `hasResponse: false`, the connect
 * happened but no signed result came back. The dApp must NOT auto-retry: with
 * `dispatched: true` the wallet may already have processed the request and a
 * blind retry can result in a duplicate transaction. Surface a button the user
 * presses deliberately, with stronger wording in the dangerous case.
 */
export type RetryPrompt =
    | { kind: 'sendTx'; dispatched: boolean }
    | { kind: 'signMessage'; dispatched: boolean };

interface SendOptions {
    /** Embed the request inside the connect URL (`enableEmbeddedRequest: true`). */
    withConnect: boolean;
    /** After send, poll on-chain for the resulting transaction before reporting success. */
    waitForTx: boolean;
}

const ok = (response: unknown): OperationResult => ({
    status: 'success',
    response: JSON.stringify(response, null, 2)
});

const fail = (error: unknown): OperationResult => ({
    status: 'error',
    response: JSON.stringify(
        { error: error instanceof Error ? error.message : 'Operation failed' },
        null,
        2
    )
});

/**
 * Owns send/sign orchestration: invokes `tonConnectUi.sendTransaction` /
 * `signMessage` with the optional embedded-connect flow, surfaces a
 * `retryPrompt` when the embedded path yields no response, and reports a
 * per-action result snapshot (`txResult` / `signResult`).
 */
export const useSendTransaction = () => {
    const [tonConnectUI] = useTonConnectUI();
    const wallet = useTonWallet();

    const [sendingTx, setSendingTx] = useState(false);
    const [waitingTx, setWaitingTx] = useState(false);
    const [signing, setSigning] = useState(false);

    const [txResult, setTxResult] = useState<OperationResult | null>(null);
    const [signResult, setSignResult] = useState<OperationResult | null>(null);
    const [retryPrompt, setRetryPrompt] = useState<RetryPrompt | null>(null);

    const sendTransaction = useCallback(
        async (tx: SendTransactionRequest, opts: SendOptions) => {
            setTxResult(null);
            setRetryPrompt(null);
            setSendingTx(true);
            setWaitingTx(false);
            try {
                let response;
                if (opts.withConnect) {
                    const embedded = await tonConnectUI.sendTransaction(tx, {
                        enableEmbeddedRequest: true
                    });
                    if (!embedded.hasResponse) {
                        setRetryPrompt({
                            kind: 'sendTx',
                            dispatched: embedded.connectResult.dispatched
                        });
                        return;
                    }
                    response = embedded.response;
                } else {
                    response = await tonConnectUI.sendTransaction(tx);
                }

                if (opts.waitForTx && wallet?.account) {
                    setWaitingTx(true);
                    const network = wallet.account.chain === CHAIN.TESTNET ? 'testnet' : 'mainnet';
                    const confirmed = await TonProofDemoApi.waitForTransaction(
                        response.boc,
                        network
                    );
                    setTxResult(ok(confirmed));
                } else {
                    setTxResult(ok(response));
                }
            } catch (error) {
                console.error('sendTransaction failed', error);
                setTxResult(fail(error));
            } finally {
                setSendingTx(false);
                setWaitingTx(false);
            }
        },
        [tonConnectUI, wallet]
    );

    const signMessage = useCallback(
        async (tx: SendTransactionRequest, opts: SendOptions) => {
            setSignResult(null);
            setRetryPrompt(null);
            setSigning(true);
            try {
                let response;
                if (opts.withConnect) {
                    const embedded = await tonConnectUI.signMessage(tx, {
                        enableEmbeddedRequest: true
                    });
                    if (!embedded.hasResponse) {
                        setRetryPrompt({
                            kind: 'signMessage',
                            dispatched: embedded.connectResult.dispatched
                        });
                        return;
                    }
                    response = embedded.response;
                } else {
                    response = await tonConnectUI.signMessage(tx);
                }
                setSignResult(ok(response));
            } catch (error) {
                console.error('signMessage failed', error);
                setSignResult(fail(error));
            } finally {
                setSigning(false);
            }
        },
        [tonConnectUI]
    );

    const dismissRetryPrompt = useCallback(() => setRetryPrompt(null), []);
    const clearTxResult = useCallback(() => setTxResult(null), []);
    const clearSignResult = useCallback(() => setSignResult(null), []);
    const clearResults = useCallback(() => {
        setTxResult(null);
        setSignResult(null);
    }, []);

    return {
        sendTransaction,
        signMessage,
        sendingTx,
        waitingTx,
        signing,
        txResult,
        signResult,
        retryPrompt,
        dismissRetryPrompt,
        clearTxResult,
        clearSignResult,
        clearResults
    };
};
