import { useState, useEffect } from 'react';

type StepStatus = 'passed' | 'failed' | 'skipped';

export function useStepStatuses(testKey: string) {
    const [stepStatuses, setStepStatuses] = useState<Record<string, StepStatus>>({});

    useEffect(() => {
        const savedStatuses = localStorage.getItem(`stepStatuses-${testKey}`);
        if (savedStatuses) {
            try {
                setStepStatuses(JSON.parse(savedStatuses));
            } catch (error) {
                console.error('Failed to parse saved step statuses:', error);
            }
        }
    }, [testKey]);

    useEffect(() => {
        if (Object.keys(stepStatuses).length > 0) {
            localStorage.setItem(`stepStatuses-${testKey}`, JSON.stringify(stepStatuses));
        }
    }, [stepStatuses, testKey]);

    const handleStepStatusChange = (stepIndex: number, status: StepStatus | null) => {
        const stepKey = `${testKey}-${stepIndex}`;
        if (status === null) {
            setStepStatuses(prev => {
                const newStatuses = { ...prev };
                delete newStatuses[stepKey];
                return newStatuses;
            });
        } else {
            setStepStatuses(prev => ({
                ...prev,
                [stepKey]: status
            }));
        }
    };

    const getStepStatus = (stepIndex: number): StepStatus | null => {
        const stepKey = `${testKey}-${stepIndex}`;
        return stepStatuses[stepKey] || null;
    };

    return {
        stepStatuses,
        handleStepStatusChange,
        getStepStatus
    };
}
