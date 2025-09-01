import { useState, useCallback } from 'react';
import { useAllureApi } from '../../../../hooks/useAllureApi';
import type { TestResultWithCustomFields } from '../../../../models';

export function useTestCaseDetails(
    testResult: TestResultWithCustomFields | undefined,
    refetchTestResult?: () => void,
    onTestCasesRefresh?: () => void,
    onTestIdChange?: (newTestId: number) => void
) {
    const api = useAllureApi();
    const [isResolving, setIsResolving] = useState(false);
    const [isFailing, setIsFailing] = useState(false);

    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    const [showFailModal, setShowFailModal] = useState(false);

    const handleResolve = useCallback(async () => {
        if (!testResult) return;
        try {
            setIsResolving(true);
            await api.resolveTestResult({ id: testResult.id, status: 'passed' });
            refetchTestResult?.();
            onTestCasesRefresh?.();
        } finally {
            setIsResolving(false);
        }
    }, [testResult, api, refetchTestResult, onTestCasesRefresh]);

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
                await api.resolveTestResult(payload);
                refetchTestResult?.();
                onTestCasesRefresh?.();
            } finally {
                setIsFailing(false);
            }
        },
        [testResult, api, refetchTestResult, onTestCasesRefresh]
    );

    const handleRerun = useCallback(async () => {
        if (!testResult) return;

        try {
            const rerunResult = await api.rerunTestResult({
                id: testResult.id,
                username: testResult.createdBy
            });

            if (rerunResult.id && onTestIdChange) {
                onTestIdChange(rerunResult.id);
                onTestCasesRefresh?.();
            } else {
                refetchTestResult?.();
                onTestCasesRefresh?.();
            }
        } catch (error) {
            console.error('Rerun failed:', error);
        }
    }, [api, testResult, refetchTestResult, onTestCasesRefresh, onTestIdChange]);

    return {
        // State
        isResolving,
        isFailing,
        validationErrors,
        showFailModal,

        // Actions
        setValidationErrors,
        setShowFailModal,
        handleResolve,
        handleFail,
        handleRerun
    };
}
