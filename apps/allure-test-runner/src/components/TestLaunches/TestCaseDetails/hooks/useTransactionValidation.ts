import { useState, useCallback, useMemo } from 'react';
import { useTonConnectUI } from '@tonconnect/ui-react';
import type { SendTransactionRequest } from '@tonconnect/ui-react';
import { evalFenceCondition } from '../../../../utils/jsonEval';
import type { TestResult } from '../../../../models';
import type { SendTransactionRpcResponse } from '@tonconnect/protocol';

// TODO: collect fields recursively
export function compareResult(result: unknown, expected: unknown, errors: string[]): boolean {
    let success = true;
    if (typeof expected === 'object' && expected !== null) {
        for (const key in expected) {
            if (typeof result === 'object' && result !== null && key in result) {
                if (
                    !compareResult(
                        (result as Record<string, unknown>)[key],
                        (expected as Record<string, unknown>)[key],
                        errors
                    )
                ) {
                    success = false;
                }
            } else {
                success = false;
                errors.push(`Missing key "${key}" in result`);
            }
        }

        return success;
    }

    if (typeof expected === 'function') {
        success = (expected as Function)(result);
        if (!success) {
            errors.push(
                `Value "${result}" does not pass condition "${(expected as Function).name}".`
            );
        }
        return success;
    }

    success = result === expected;
    if (!success) {
        errors.push(`Expected "${expected}", but got "${result}"`);
    }
    return success;
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

    const isResultValid = useMemo(
        () =>
            transactionResult && testResult
                ? (() => {
                      const errors: string[] = [];
                      const parsedExpected = evalFenceCondition(testResult.expectedResult);
                      const res = compareResult(transactionResult, parsedExpected, errors);
                      setValidationErrors(errors);

                      // Show fail modal if validation failed
                      if (!res && errors.length > 0) {
                          setShowFailModal(true);
                      } else if (testResult.status !== 'passed') {
                          handleResolve();
                      }

                      return res;
                  })()
                : undefined,
        [transactionResult]
    );

    const handleSendTransaction = useCallback(async () => {
        if (!sendTransactionParams) {
            setTransactionResult({
                error: 'No precondition',
                timestamp: new Date().toISOString()
            });
            return;
        }

        let rpcResponse: SendTransactionRpcResponse | undefined = undefined;
        const origDebug = console.debug.bind(console);
        console.debug = (...args: unknown[]) => {
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
