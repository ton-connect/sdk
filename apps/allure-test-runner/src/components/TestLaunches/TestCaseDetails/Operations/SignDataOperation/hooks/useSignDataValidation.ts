import { useState, useCallback, useMemo, useEffect } from 'react';
import { type SignDataPayload, useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { evalFenceCondition } from '../../../../../../utils/jsonEval';
import type { TestResult } from '../../../../../../models';
import type { SignDataRpcRequest, SignDataRpcResponse } from '@tonconnect/protocol';
import { compareResult } from '../../../../../../utils/compareResult';
import type { SignDataResponse } from '@tonconnect/ui-react';

export function useSignDataValidation({
    testResult,
    setValidationErrors,
    showValidationModal,
    setShowStatusModal
}: {
    testResult: TestResult | undefined;
    setValidationErrors: (value: string[]) => void;
    showValidationModal: (isSuccess: boolean, errors?: string[]) => void;
    setShowStatusModal: (value: boolean) => void;
}) {
    const [tonConnectUI] = useTonConnectUI();
    const wallet = useTonWallet();
    const [signDataResult, setSignDataResult] = useState<Record<string, unknown>>();

    const signDataPayload = useMemo(
        () => evalFenceCondition<SignDataPayload>(testResult?.precondition, { wallet }),
        [wallet, testResult]
    );

    const [isResultValid, setIsResultValid] = useState(true);

    useEffect(() => {
        setSignDataResult(undefined);
        setIsResultValid(true);
        setValidationErrors([]);
        setShowStatusModal(false);
    }, [testResult?.id, setShowStatusModal]);

    const handleSignData = useCallback(async () => {
        if (!signDataPayload || !testResult) {
            setSignDataResult({
                error: 'No precondition'
            });
            return;
        }

        let rpcRequest: SignDataRpcRequest | undefined = undefined;
        let rpcResponse: SignDataRpcResponse | undefined = undefined;
        const origDebug = console.debug.bind(console);
        console.debug = (...args: unknown[]) => {
            if (
                args.includes('Send http-bridge request:') ||
                args.includes('Send injected-bridge request:')
            ) {
                rpcRequest = args[2] as SignDataRpcRequest;
            }
            if (args.includes('Wallet message received:')) {
                console.debug = origDebug;
                rpcResponse = args[2] as SignDataRpcResponse;
            }
            origDebug(...args);
        };

        let signDataResponse: SignDataResponse | undefined = undefined;
        try {
            setSignDataResult(undefined);

            signDataResponse = await tonConnectUI.signData(signDataPayload);
        } catch (error) {
        } finally {
            setSignDataResult(rpcResponse);
        }

        const parsedExpected = evalFenceCondition(testResult.expectedResult, {
            signDataRpcRequest: rpcRequest,
            signDataResponse,
            wallet
        });

        const [isResultValid, errors] = compareResult(rpcResponse, parsedExpected);

        setIsResultValid(isResultValid);
        setValidationErrors(errors);

        if (!isResultValid && errors.length > 0) {
            showValidationModal(false, errors);
        } else if (testResult.status !== 'passed') {
            showValidationModal(true);
        }
    }, [signDataPayload, tonConnectUI, wallet]);

    return {
        // State
        signDataPayload,
        signDataResult,
        tonConnectUI,
        isResultValid,

        // Actions
        handleSignData
    };
}
