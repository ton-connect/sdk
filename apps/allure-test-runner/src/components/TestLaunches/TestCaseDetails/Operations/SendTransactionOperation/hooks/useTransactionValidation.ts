import { useState, useCallback, useMemo, useEffect } from 'react';
import { CHAIN, useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import type { SendTransactionRequest } from '@tonconnect/ui-react';
import { evalFenceCondition } from '../../../../../../utils/jsonEval';
import type { TestResult } from '../../../../../../models';
import type { SendTransactionRpcRequest, SendTransactionRpcResponse } from '@tonconnect/protocol';
import { compareResult } from '../../../../../../utils/compareResult';
import { waitForTransaction } from '../../../../../../services/waitForTransaction';

export function useTransactionValidation({
    testResult,
    setValidationErrors,
    setShowFailModal,
    handleResolve,
    waitForTx
}: {
    testResult: TestResult | undefined;
    setValidationErrors: (value: string[]) => void;
    setShowFailModal: (value: boolean) => void;
    handleResolve: () => void;
    waitForTx?: boolean;
}) {
    const [tonConnectUI] = useTonConnectUI();
    const wallet = useTonWallet();

    const [transactionResult, setTransactionResult] = useState<Record<string, unknown>>();
    const [isWaitingForTx, setIsWaitingForTx] = useState(false);
    const [confirmedTransaction, setConfirmedTransaction] = useState<Record<string, unknown>>();
    const [explorerUrl, setExplorerUrl] = useState<string | null>(null);

    const sendTransactionParams = useMemo(
        () =>
            evalFenceCondition<SendTransactionRequest>(testResult?.precondition, {
                sender: wallet?.account?.address,
                wallet
            }),
        [wallet, testResult]
    );

    const [isResultValid, setIsResultValid] = useState(true);

    useEffect(() => {
        setTransactionResult(undefined);
        setConfirmedTransaction(undefined);
        setIsResultValid(true);
        setValidationErrors([]);
        setShowFailModal(false);
    }, [testResult?.id]);

    const handleSendTransaction = useCallback(async () => {
        if (!sendTransactionParams || !testResult) {
            setTransactionResult({
                error: 'No precondition',
                timestamp: new Date().toISOString()
            });
            return;
        }

        let rpcRequest: SendTransactionRpcRequest | undefined = undefined;
        let rpcResponse: SendTransactionRpcResponse | undefined = undefined;
        const origDebug = console.debug.bind(console);
        console.debug = (...args: unknown[]) => {
            if (args.includes('Send http-bridge request:')) {
                rpcRequest = args[2] as SendTransactionRpcRequest;
            }
            if (args.includes('Wallet message received:')) {
                console.debug = origDebug;
                rpcResponse = args[2] as SendTransactionRpcResponse;
            }
            origDebug(...args);
        };

        try {
            setTransactionResult(undefined);
            if (waitForTx) setIsWaitingForTx(true);

            const sent = await tonConnectUI.sendTransaction(sendTransactionParams);
            setTransactionResult(rpcResponse);
            if (waitForTx && wallet?.account && sent?.boc) {
                try {
                    const network = wallet.account.chain === CHAIN.TESTNET ? 'testnet' : 'mainnet';
                    const result = await waitForTransaction(sent.boc, network);
                    setExplorerUrl(result);
                } catch {
                } finally {
                    setIsWaitingForTx(false);
                }
            } else if (waitForTx) {
                setIsWaitingForTx(false);
            }
        } catch (error) {
            if (waitForTx) {
                setIsWaitingForTx(false);
            }
        } finally {
            setTransactionResult(rpcResponse);
        }

        const parsedExpected = evalFenceCondition(testResult.expectedResult, {
            sendTransactionRpcRequest: rpcRequest,
            sendTransactionParams,
            wallet
        });
        const [isResultValid, errors] = compareResult(rpcResponse, parsedExpected);

        setIsResultValid(isResultValid);
        setValidationErrors(errors);

        if (!isResultValid && errors.length > 0) {
            setShowFailModal(true);
        } else if (testResult.status !== 'passed') {
            handleResolve();
        }
    }, [sendTransactionParams, tonConnectUI, waitForTx, wallet?.account?.chain, explorerUrl]);

    return {
        // State
        sendTransactionParams,
        transactionResult,
        confirmedTransaction,
        explorerUrl,
        tonConnectUI,
        isResultValid,
        isWaitingForTx,

        // Actions
        handleSendTransaction
    };
}
