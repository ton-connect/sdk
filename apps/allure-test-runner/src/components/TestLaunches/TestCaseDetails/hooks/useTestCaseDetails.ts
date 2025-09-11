import { useState, useCallback } from 'react';
import type { TestResultWithCustomFields, ResolveTestResultParams } from '../../../../models';
import {
    useResolveTestResultMutation,
    useRerunTestResultMutation
} from '../../../../store/api/allureApi';

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
    const [resolveTestResultTrigger] = useResolveTestResultMutation();
    const [rerunTestResultTrigger] = useRerunTestResultMutation();

    const [isResolving, setIsResolving] = useState(false);
    const [isFailing, setIsFailing] = useState(false);

    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    const [showStatusModal, setShowStatusModal] = useState(false);
    const [statusModalInitialStatus, setStatusModalInitialStatus] = useState<'passed' | 'failed'>(
        'failed'
    );
    const [statusModalMessage, setStatusModalMessage] = useState<string>('');

    const handleResolve = useCallback(
        async (reason?: string) => {
            if (!testResult) return;
            try {
                setIsResolving(true);

                const testKey = `${testResult.launchId}-${testResult.id}`;

                const payload: ResolveTestResultParams = {
                    id: testResult.id,
                    status: 'passed' as const
                };

                if (reason?.trim()) {
                    payload.message = reason.trim();
                }

                const execution = createExecutionData(testResult, testKey, 'passed');
                if (execution) {
                    payload.execution = execution;
                }

                await resolveTestResultTrigger(payload).unwrap();
                refetchTestResult?.();
                onTestCasesRefresh?.();
            } finally {
                setIsResolving(false);
            }
        },
        [testResult, resolveTestResultTrigger, refetchTestResult, onTestCasesRefresh]
    );

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

                await resolveTestResultTrigger(payload).unwrap();
                refetchTestResult?.();
                onTestCasesRefresh?.();
            } finally {
                setIsFailing(false);
            }
        },
        [testResult, resolveTestResultTrigger, refetchTestResult, onTestCasesRefresh]
    );

    const handleRerun = useCallback(async () => {
        if (!testResult) return;

        try {
            const rerunResult = await rerunTestResultTrigger({
                id: testResult.id,
                username: testResult.createdBy
            }).unwrap();

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
    }, [rerunTestResultTrigger, testResult, refetchTestResult, onTestCasesRefresh, onTestIdChange]);

    const showValidationModal = useCallback((isSuccess: boolean, errors: string[] = []) => {
        setValidationErrors(errors);

        if (isSuccess) {
            setStatusModalInitialStatus('passed');
            setStatusModalMessage('');
        } else {
            setStatusModalInitialStatus('failed');
            setStatusModalMessage(errors.join('\n'));
        }

        setShowStatusModal(true);
    }, []);

    const handleStatusModalSubmit = useCallback(
        (status: 'passed' | 'failed', reason?: string) => {
            if (status === 'passed') {
                handleResolve(reason);
            } else {
                handleFail(reason || statusModalMessage);
            }
            setShowStatusModal(false);
            setValidationErrors([]);
            setStatusModalMessage('');
        },
        [handleResolve, handleFail, statusModalMessage]
    );

    return {
        isResolving,
        isFailing,
        validationErrors,
        showStatusModal,
        statusModalInitialStatus,
        statusModalMessage,
        setValidationErrors,
        handleResolve,
        handleFail,
        handleRerun,
        showValidationModal,
        handleStatusModalSubmit,
        setShowStatusModal
    };
}
