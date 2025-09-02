import { useState } from 'react';
import { useStepStatuses } from './useStepStatuses';
import { useStepDropdown } from './useStepDropdown';
import type { TestResultWithCustomFields, ExecutionStep } from '../../../../models';

type StepStatus = 'passed' | 'failed' | 'skipped';

export function useTestSteps(testResult: TestResultWithCustomFields) {
    const [isStepsExpanded, setIsStepsExpanded] = useState(true);
    const testKey = `${testResult.launchId}-${testResult.id}`;

    const { getStepStatus, handleStepStatusChange } = useStepStatuses(testKey);
    const { openDropdown, dropdownPosition, handleDropdownToggle, closeDropdown } =
        useStepDropdown();

    const canEditStepStatus = (testStatus?: string) => {
        return testStatus !== 'passed' && testStatus !== 'failed';
    };

    const handleStatusSelect = (
        stepIndex: number,
        status: StepStatus,
        currentStatus: StepStatus | null,
        event?: React.MouseEvent
    ) => {
        if (event) {
            event.stopPropagation();
            event.preventDefault();
        }

        // Если кликнули на текущий статус - сбрасываем его
        if (status === currentStatus) {
            handleStepStatusChange(stepIndex, null);
        } else {
            // Иначе устанавливаем новый статус
            handleStepStatusChange(stepIndex, status);
        }

        closeDropdown();
    };

    const toggleStepsExpanded = () => {
        setIsStepsExpanded(!isStepsExpanded);
    };

    const getCurrentStepStatus = (step: ExecutionStep, index: number, isEditable: boolean) => {
        return isEditable ? getStepStatus(index) : step.status || null;
    };

    return {
        // State
        isStepsExpanded,
        openDropdown,
        dropdownPosition,

        // Actions
        toggleStepsExpanded,
        handleStatusSelect,
        handleDropdownToggle,
        closeDropdown,

        // Helpers
        canEditStepStatus,
        getCurrentStepStatus,

        // Data
        testKey
    };
}
