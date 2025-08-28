import { useState, useCallback, useEffect } from 'react';
import { useQuery } from '../../../../hooks/useQuery';
import { useAllureApi } from '../../../../hooks/useAllureApi';
import type { TestResult, TestResultWithCustomFields } from '../../../../models';
import { AllureService } from '../../../../services/allure.service';

export function useTestCaseDetails(testId: number | null, onTestCasesRefresh?: () => void) {
    const api = useAllureApi();
    const [isSwitching, setIsSwitching] = useState(false);
    const [isResolving, setIsResolving] = useState(false);
    const [isFailing, setIsFailing] = useState(false);

    const {
        loading,
        result: testResult,
        refetch
    } = useQuery<TestResult | undefined>(
        signal => (testId ? api.getTestResult(testId, signal) : Promise.resolve(undefined)),
        { deps: [api, testId] }
    );

    const { result: testResultWithCustomFields } = useQuery<TestResultWithCustomFields | undefined>(
        signal =>
            testResult
                ? AllureService.from(api, signal).populateWithCustomFields(testResult)
                : Promise.resolve(undefined),
        {
            deps: [api, testResult]
        }
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
            await api.resolveTestResult({ id: testResult.id, status: 'passed' });
            refetch();
            onTestCasesRefresh?.();
        } finally {
            setIsResolving(false);
        }
    }, [testResult, api, refetch, onTestCasesRefresh]);

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
                refetch();
                onTestCasesRefresh?.();
            } finally {
                setIsFailing(false);
            }
        },
        [testResult, api, refetch, onTestCasesRefresh]
    );

    const handleRerun = useCallback(async () => {
        if (!testResult) return;

        await api.rerunTestResult({ id: testResult.id, username: testResult.createdBy });
        refetch();
        onTestCasesRefresh?.();
    }, [api, testResult, onTestCasesRefresh]);

    return {
        // State
        testResult,
        loading,
        isSwitching,
        isResolving,
        isFailing,
        testResultWithCustomFields,
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
