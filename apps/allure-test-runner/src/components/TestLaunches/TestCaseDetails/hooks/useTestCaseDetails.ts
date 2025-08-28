import { useState, useCallback, useMemo, useEffect } from 'react';
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { useQuery } from '../../../../hooks/useQuery';
import { useAllureApi } from '../../../../hooks/useAllureApi';
import { evalFenceCondition } from '../../../../utils/jsonEval';
import type { TestResult } from '../../../../models';
import type { SendTransactionRpcResponse } from '@tonconnect/protocol';

interface TransactionData {
    validUntil: number;
    messages: Array<{
        address: string;
        amount: string;
        stateInit?: string;
        payload?: string;
    }>;
}

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

export function useTestCaseDetails(testId: number | null, onTestCasesRefresh?: () => void) {
    const client = useAllureApi();
    const [tonConnectUI] = useTonConnectUI();
    const wallet = useTonWallet();
    const [transactionResult, setTransactionResult] = useState<Record<string, unknown>>();
    const [isSending, setIsSending] = useState(false);
    const [isSwitching, setIsSwitching] = useState(false);
    const [isResolving, setIsResolving] = useState(false);
    const [isFailing, setIsFailing] = useState(false);
    const [expandedPrecondition, setExpandedPrecondition] = useState(true);
    const [expandedExpectedResult, setExpandedExpectedResult] = useState(true);
    const [expandedTransactionResult, setExpandedTransactionResult] = useState(true);

    const { loading, result, refetch } = useQuery<TestResult | undefined>(
        signal => (testId ? client.getTestResult(testId, signal) : Promise.resolve(undefined)),
        { deps: [client, testId] }
    );

    const parsedPre = useMemo(
        () => evalFenceCondition<TransactionData>(result?.precondition),
        [result]
    );
    const parsedExpected = useMemo(() => evalFenceCondition(result?.expectedResult), [result]);

    useEffect(() => {
        if (testId) {
            setIsSwitching(true);
            setTransactionResult(undefined);
        }
    }, [testId]);

    useEffect(() => {
        if (result) {
            setIsSwitching(false);
        }
    }, [result]);

    // TODO: refactor (errors not displaying) (not updating)
    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    const [showFailModal, setShowFailModal] = useState(false);

    const isResultValid = useMemo(
        () =>
            transactionResult
                ? (() => {
                      const errors: string[] = [];
                      const res = compareResult(transactionResult, parsedExpected, errors);
                      setValidationErrors(errors);

                      // Show fail modal if validation failed
                      if (!res && errors.length > 0) {
                          setShowFailModal(true);
                      }

                      return res;
                  })()
                : true,
        [transactionResult, parsedExpected]
    );

    const handleSendTransaction = useCallback(async () => {
        if (!parsedPre) {
            setTransactionResult({
                error: 'No precondition data available',
                timestamp: new Date().toISOString()
            });
            return;
        }

        let res2: SendTransactionRpcResponse | undefined = undefined;
        const origDebug = console.debug.bind(console);
        console.debug = (...args: unknown[]) => {
            if (args.includes('Wallet message received:')) {
                console.debug = origDebug;
                res2 = args[2] as SendTransactionRpcResponse;
            }
            origDebug(...args);
        };

        try {
            setIsSending(true);
            setTransactionResult(undefined);

            const transaction = {
                validUntil: Math.floor(Date.now() / 1000) + 300,
                messages: parsedPre.messages
            };

            await tonConnectUI.sendTransaction(transaction);
        } catch (error) {
        } finally {
            setTransactionResult(res2);
            setIsSending(false);
        }
    }, [parsedPre, tonConnectUI]);

    const handleResolve = useCallback(async () => {
        if (!result) return;
        try {
            setIsResolving(true);
            await client.resolveTestResult({ id: result.id, status: 'passed' });
            await refetch();
            // Обновляем список тест-кейсов после изменения статуса
            onTestCasesRefresh?.();
        } finally {
            setIsResolving(false);
        }
    }, [result, client, refetch, onTestCasesRefresh]);

    // Auto-resolve test if validation passed
    useEffect(() => {
        if (transactionResult && isResultValid && result && result.status !== 'passed') {
            handleResolve();
        }
    }, [transactionResult, isResultValid, result, handleResolve]);

    const handleFail = useCallback(
        async (message: string) => {
            if (!result) return;
            try {
                setIsFailing(true);
                const payload: { id: number; status: 'failed'; message?: string } = {
                    id: result.id,
                    status: 'failed'
                };
                if (message.trim()) {
                    payload.message = message.trim();
                }
                await client.resolveTestResult(payload);
                refetch();
                onTestCasesRefresh?.();
            } finally {
                setIsFailing(false);
            }
        },
        [result, client, refetch, onTestCasesRefresh]
    );

    const togglePrecondition = useCallback(() => {
        setExpandedPrecondition(prev => !prev);
    }, []);

    const toggleExpectedResult = useCallback(() => {
        setExpandedExpectedResult(prev => !prev);
    }, []);

    const toggleTransactionResult = useCallback(() => {
        setExpandedTransactionResult(prev => !prev);
    }, []);

    return {
        // State
        result,
        loading,
        isSwitching,
        isSending,
        isResolving,
        isFailing,
        transactionResult,
        parsedPre,
        parsedExpected,
        expandedPrecondition,
        expandedExpectedResult,
        expandedTransactionResult,
        wallet,
        tonConnectUI,
        isResultValid,
        validationErrors,
        showFailModal,
        setShowFailModal,

        // Actions
        handleSendTransaction,
        handleResolve,
        handleFail,
        togglePrecondition,
        toggleExpectedResult,
        toggleTransactionResult
    };
}
