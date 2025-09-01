import { useState, useCallback, useMemo } from 'react';
import { type SignDataPayload, useTonConnectUI } from '@tonconnect/ui-react';
import { evalFenceCondition } from '../../../../../../utils/jsonEval';
import type { TestResult } from '../../../../../../models';
import type { SignDataRpcRequest, SignDataRpcResponse } from '@tonconnect/protocol';
import { compareResult } from '../../../../../../utils/compareResult';

export function useSignDataValidation({
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
    const [signDataResult, setSignDataResult] = useState<Record<string, unknown>>();

    const signDataPayload = useMemo(
        () => evalFenceCondition<SignDataPayload>(testResult?.precondition),
        [testResult]
    );

    const [isResultValid, setIsResultValid] = useState(true);

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
            if (args.includes('Send http-bridge request:')) {
                rpcRequest = args[2] as SignDataRpcRequest;
            }
            if (args.includes('Wallet message received:')) {
                console.debug = origDebug;
                rpcResponse = args[2] as SignDataRpcResponse;
            }
            origDebug(...args);
        };

        try {
            setSignDataResult(undefined);

            await tonConnectUI.signData(signDataPayload);
        } catch (error) {
        } finally {
            setSignDataResult(rpcResponse);
        }

        const parsedExpected = evalFenceCondition(testResult.expectedResult);
        console.log('PARSED', parsedExpected);
        const [isResultValid, errors] = compareResult(rpcResponse, parsedExpected, {
            signDataRpcRequest: rpcRequest,
            signDataPayload
        });

        setIsResultValid(isResultValid);
        setValidationErrors(errors);

        if (!isResultValid && errors.length > 0) {
            setShowFailModal(true);
        } else if (testResult.status !== 'passed') {
            handleResolve();
        }
    }, [signDataPayload, tonConnectUI]);

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
