import { useState, useCallback, useMemo, useEffect } from 'react';
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { useQuery } from '../../../../hooks/useQuery';
import { useAllureApi } from '../../../../hooks/useAllureApi';
import { tryParseJson } from '../../../../utils/parse-json';
import type { TestResult } from '../../../../models';

interface TransactionData {
    validUntil: number;
    messages: Array<{
        address: string;
        amount: string;
        stateInit?: string;
        payload?: string;
    }>;
}

export function useTestCaseDetails(testId: number | null, onTestCasesRefresh?: () => void) {
    const client = useAllureApi();
    const [tonConnectUI] = useTonConnectUI();
    const wallet = useTonWallet();
    const [transactionResult, setTransactionResult] = useState<string | null>(null);
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

    const parsedPre = useMemo(() => {
        const parsed = tryParseJson(result?.precondition);
        return parsed &&
            typeof parsed === 'object' &&
            'validUntil' in parsed &&
            'messages' in parsed
            ? (parsed as TransactionData)
            : null;
    }, [result]);

    const parsedExpected = useMemo(() => tryParseJson(result?.expectedResult), [result]);

    useEffect(() => {
        if (testId) {
            setIsSwitching(true);
            setTransactionResult(null);
        }
    }, [testId]);

    useEffect(() => {
        if (result) {
            setIsSwitching(false);
        }
    }, [result]);

    const handleSendTransaction = useCallback(async () => {
        if (!parsedPre) {
            setTransactionResult(
                JSON.stringify(
                    {
                        error: 'No precondition data available',
                        timestamp: new Date().toISOString()
                    },
                    null,
                    2
                )
            );
            return;
        }

        try {
            setIsSending(true);
            setTransactionResult(null);

            const transaction = {
                validUntil: Math.floor(Date.now() / 1000) + 300,
                messages: parsedPre.messages
            };

            const result = await tonConnectUI.sendTransaction(transaction);
            setTransactionResult(
                JSON.stringify(
                    {
                        success: true,
                        message: 'Transaction sent successfully',
                        result: result,
                        timestamp: new Date().toISOString(),
                        transaction: transaction
                    },
                    null,
                    2
                )
            );
        } catch (error) {
            setTransactionResult(
                JSON.stringify(
                    {
                        success: false,
                        error: error instanceof Error ? error.message : 'Unknown error',
                        timestamp: new Date().toISOString(),
                        transaction: {
                            validUntil: Math.floor(Date.now() / 1000) + 300,
                            messages: parsedPre.messages
                        }
                    },
                    null,
                    2
                )
            );
        } finally {
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
                await refetch();
                // Обновляем список тест-кейсов после изменения статуса
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

        // Actions
        handleSendTransaction,
        handleResolve,
        handleFail,
        togglePrecondition,
        toggleExpectedResult,
        toggleTransactionResult
    };
}
