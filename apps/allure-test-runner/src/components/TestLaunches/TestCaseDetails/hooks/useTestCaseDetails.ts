import { useState, useCallback, useEffect } from 'react';
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { useQuery } from '../../../../hooks/useQuery';
import { useAllureApi } from '../../../../hooks/useAllureApi';
import type { TestResult } from '../../../../models';

export function useTestCaseDetails(testId: number | null, onTestCasesRefresh?: () => void) {
    const client = useAllureApi();
    const [tonConnectUI] = useTonConnectUI();
    const wallet = useTonWallet();
    const [isSwitching, setIsSwitching] = useState(false);
    const [isResolving, setIsResolving] = useState(false);
    const [isFailing, setIsFailing] = useState(false);

    const {
        loading,
        result: testResult,
        refetch
    } = useQuery<TestResult | undefined>(
        signal => (testId ? client.getTestResult(testId, signal) : Promise.resolve(undefined)),
        { deps: [client, testId] }
    );

    useEffect(() => {
        if (testId) {
            setIsSwitching(true);
        }
    }, [testId]);

    useEffect(() => {
        if (testResult) {
            setIsSwitching(false);
        }
    }, [testResult]);

    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    const [showFailModal, setShowFailModal] = useState(false);

    const handleResolve = useCallback(async () => {
        if (!testResult) return;
        try {
            setIsResolving(true);
            await client.resolveTestResult({ id: testResult.id, status: 'passed' });
            refetch();
            onTestCasesRefresh?.();
        } finally {
            setIsResolving(false);
        }
    }, [testResult, client, refetch, onTestCasesRefresh]);

    const handleFail = useCallback(
        async (message: string) => {
            if (!testResult) return;
            try {
                setIsFailing(true);
                const payload: { id: number; status: 'failed'; message?: string } = {
                    id: testResult.id,
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
        [testResult, client, refetch, onTestCasesRefresh]
    );

    const handleRerun = useCallback(async () => {
        if (!testResult) return;

        await client.rerunTestResult({ id: testResult.id, username: testResult.createdBy });
        refetch();
        onTestCasesRefresh?.();
    }, [testResult, onTestCasesRefresh]);

    return {
        // State
        testResult,
        loading,
        isSwitching,
        isResolving,
        isFailing,
        wallet,
        tonConnectUI,
        setValidationErrors,
        validationErrors,
        showFailModal,
        setShowFailModal,

        // Actions
        handleResolve,
        handleFail,
        handleRerun
    };
}
