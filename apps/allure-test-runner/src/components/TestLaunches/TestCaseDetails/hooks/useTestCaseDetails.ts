import { useState, useCallback } from 'react';
import { useAllureApi } from '../../../../hooks/useAllureApi';
import type { TestResultWithCustomFields, ResolveTestResultParams } from '../../../../models';

type StepStatus = 'passed' | 'failed' | 'skipped';

function getStepStatusesFromStorage(testKey: string): Record<string, StepStatus> {
    try {
        const savedStatuses = localStorage.getItem(`stepStatuses-${testKey}`);
        return savedStatuses ? JSON.parse(savedStatuses) : {};
    } catch (error) {
        console.error('Failed to parse saved step statuses:', error);
        return {};
    }
}

function createExecutionData(
    testResult: TestResultWithCustomFields,
    testKey: string,
    executionStatus: 'passed' | 'failed'
) {
    if (!testResult.execution?.steps || testResult.execution.steps.length === 0) {
        return null;
    }

    const stepStatuses = getStepStatusesFromStorage(testKey);
    const steps = testResult.execution.steps.map((step, index) => {
        const stepKey = `${testKey}-${index}`;
        const stepStatus = stepStatuses[stepKey] || 'skipped';

        return {
            type: step.type,
            body: step.body,
            showMessage: step.showMessage || false,
            steps: [],
            markup: step.body ? `<p>${step.body}</p>` : undefined,
            status: stepStatus
        };
    });

    return {
        status: executionStatus,
        steps
    };
}

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

            const testKey = `${testResult.launchId}-${testResult.id}`;

            const payload: ResolveTestResultParams = {
                id: testResult.id,
                status: 'passed' as const
            };

            // Добавляем execution если есть шаги
            const execution = createExecutionData(testResult, testKey, 'passed');
            if (execution) {
                payload.execution = execution;
            }

            await api.resolveTestResult(payload);
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

                const testKey = `${testResult.launchId}-${testResult.id}`;

                const payload: ResolveTestResultParams = {
                    id: testResult.id,
                    status: 'failed' as const
                };

                if (message.trim()) {
                    payload.message = message.trim();
                }

                const execution = createExecutionData(testResult, testKey, 'failed');
                if (execution) {
                    payload.execution = execution;
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
