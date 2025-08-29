import { useState, useCallback, useMemo } from 'react';
import { useTonConnectUI } from '@tonconnect/ui-react';
import type { SendTransactionRequest } from '@tonconnect/ui-react';
import { evalFenceCondition } from '../../../../utils/jsonEval';
import type { TestResult } from '../../../../models';
import type { SendTransactionRpcRequest, SendTransactionRpcResponse } from '@tonconnect/protocol';

function compareResult(result: unknown, expected: unknown, context: unknown = undefined) {
    const errors: string[] = [];
    const success = compareResultInner(result, expected, context, errors);
    return [success, errors] as const;
}

function compareResultInner(
    result: unknown,
    expected: unknown,
    context: unknown,
    errors: string[],
    path: string = ''
): boolean {
    let success = true;
    const field = path ? `field "${path}"` : 'value';

    if (typeof expected === 'object' && expected !== null) {
        if (typeof result !== 'object' || result === null) {
            errors.push(`${field}: expected object, got ${typeof result}`);
            return false;
        }

        for (const key in expected) {
            const newPath = path ? `${path}.${key}` : key;

            if (key in (result as Record<string, unknown>)) {
                if (
                    !compareResultInner(
                        (result as Record<string, unknown>)[key],
                        (expected as Record<string, unknown>)[key],
                        context,
                        errors,
                        newPath
                    )
                ) {
                    success = false;
                }
            } else {
                success = false;
                errors.push(`field "${newPath}" is missing`);
            }
        }
        return success;
    }

    if (typeof expected === 'function') {
        const passed = expected(result, context);
        if (!passed) {
            errors.push(
                `${field}: value "${result}" failed for predicate ${expected.name || 'predicate'}`
            );
        }
        return passed;
    }

    if (result !== expected) {
        errors.push(`${field}: expected "${expected}", got "${result}"`);
        return false;
    }

    return true;
}

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
    const [transactionResult, setTransactionResult] = useState<Record<string, unknown>>();
    const [isSending, setIsSending] = useState(false);

    const sendTransactionParams = useMemo(
        () => evalFenceCondition<SendTransactionRequest>(testResult?.precondition),
        [testResult]
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
            setIsSending(true);
            setTransactionResult(undefined);

            const transaction = {
                validUntil: Math.floor(Date.now() / 1000) + 300,
                messages: sendTransactionParams.messages
            };

            await tonConnectUI.sendTransaction(transaction);
        } catch (error) {
        } finally {
            setTransactionResult(rpcResponse);
            setIsSending(false);
        }

        const parsedExpected = evalFenceCondition(testResult.expectedResult);
        const [isResultValid, errors] = compareResult(rpcResponse, parsedExpected, {
            sendTransactionRpcRequest: rpcRequest
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
        isSending,
        sendTransactionParams,
        transactionResult,
        tonConnectUI,
        isResultValid,

        // Actions
        handleSendTransaction
    };
}
