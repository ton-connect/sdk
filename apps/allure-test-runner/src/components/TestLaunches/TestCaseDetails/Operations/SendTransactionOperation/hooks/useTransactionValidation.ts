import { useState, useCallback, useMemo } from 'react';
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import type { SendTransactionRequest } from '@tonconnect/ui-react';
import { evalFenceCondition, evalWithContext } from '../../../../../../utils/jsonEval';
import type { TestResult } from '../../../../../../models';
import type { SendTransactionRpcRequest, SendTransactionRpcResponse } from '@tonconnect/protocol';
import { compareResult } from '../../../../../../utils/compareResult';

export function useTransactionValidation({
    testResult,
    setValidationErrors,
    setShowFailModal,
    handleResolve
}: {
    testResult: TestResult | undefined;
    setValidationErrors: (value: string[]) => void;
    setShowFailModal: (value: boolean) => void;
    handleResolve: () => void;
}) {
    const [tonConnectUI] = useTonConnectUI();
    const wallet = useTonWallet();

    const [transactionResult, setTransactionResult] = useState<Record<string, unknown>>();

    const sendTransactionParams = useMemo(
        () =>
            evalWithContext<SendTransactionRequest>(testResult?.precondition, {
                sender: wallet?.account.address
            }),
        [wallet, testResult]
    );

    const [isResultValid, setIsResultValid] = useState(true);

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

            await tonConnectUI.sendTransaction(sendTransactionParams);
        } catch (error) {
        } finally {
            setTransactionResult(rpcResponse);
        }

        const parsedExpected = evalFenceCondition(testResult.expectedResult);
        const [isResultValid, errors] = compareResult(rpcResponse, parsedExpected, {
            sendTransactionRpcRequest: rpcRequest,
            sendTransactionParams
        });

        setIsResultValid(isResultValid);
        setValidationErrors(errors);

        if (!isResultValid && errors.length > 0) {
            setShowFailModal(true);
        } else if (testResult.status !== 'passed') {
            handleResolve();
        }
    }, [sendTransactionParams, tonConnectUI]);

    return {
        // State
        sendTransactionParams,
        transactionResult,
        tonConnectUI,
        isResultValid,

        // Actions
        handleSendTransaction
    };
}
