import { useTestSteps } from './hooks/useTestSteps';
import type { TestResultWithCustomFields } from '../../../models';
import { CheckCircle, XCircle, Minus } from 'lucide-react';
import { Caption } from '../../ui/typography';
import { useState, useEffect } from 'react';

type TestStepsProps = {
    testResult: TestResultWithCustomFields;
};

export function TestSteps({ testResult }: TestStepsProps) {
    const { handleStatusSelect, canEditStepStatus, getCurrentStepStatus } =
        useTestSteps(testResult);

    const [expandedStep, setExpandedStep] = useState<number | null>(null);

    // Close expanded menu when clicking outside
    useEffect(() => {
        const handleClickOutside = () => {
            if (expandedStep !== null) {
                setExpandedStep(null);
            }
        };

        if (expandedStep !== null) {
            document.addEventListener('click', handleClickOutside);
            return () => document.removeEventListener('click', handleClickOutside);
        }
    }, [expandedStep]);

    if (!testResult.execution?.steps || testResult.execution.steps.length === 0) {
        return null;
    }

    return (
        <div className="space-y-2">
            <Caption className="font-medium text-muted-foreground">Test Steps:</Caption>
            <div className="rounded border border-border/50 p-2">
                <div className="space-y-1">
                    {testResult.execution.steps.map((step, index) => {
                        const isEditable = canEditStepStatus(testResult.status);
                        const currentStatus = getCurrentStepStatus(step, index, isEditable);

                        const StatusIcon = () => {
                            if (currentStatus === 'passed')
                                return <CheckCircle className="h-4 w-4 text-green-600" />;
                            if (currentStatus === 'failed')
                                return <XCircle className="h-4 w-4 text-red-600" />;
                            if (currentStatus === 'skipped')
                                return <Minus className="h-4 w-4 text-yellow-600" />;
                            return (
                                <div className="h-4 w-4 border-2 border-muted-foreground rounded-full" />
                            );
                        };

                        return (
                            <div key={index} className="flex items-start gap-2">
                                <Caption className="text-muted-foreground w-5 flex-shrink-0 text-xs mt-0.5">
                                    {index + 1}.
                                </Caption>

                                {isEditable ? (
                                    <div className="group relative flex-shrink-0">
                                        {/* Current status icon - clickable on mobile, hoverable on desktop */}
                                        <button
                                            className="flex items-center justify-center w-4 h-4 touch-manipulation"
                                            onClick={e => {
                                                e.stopPropagation();
                                                setExpandedStep(
                                                    expandedStep === index ? null : index
                                                );
                                            }}
                                        >
                                            <StatusIcon />
                                        </button>

                                        {/* Status buttons - shown on hover (desktop) or tap (mobile) */}
                                        <div
                                            className={`absolute -left-[6.4px] -top-[6.4px] items-center gap-0.5 bg-card border border-border rounded-md shadow-lg p-1 z-10 ${
                                                expandedStep === index
                                                    ? 'flex'
                                                    : 'hidden group-hover:flex'
                                            }`}
                                        >
                                            <button
                                                onClick={e => {
                                                    e.stopPropagation();
                                                    handleStatusSelect(
                                                        index,
                                                        'passed',
                                                        currentStatus,
                                                        e
                                                    );
                                                    setExpandedStep(null);
                                                }}
                                                className={`p-1 rounded transition-colors hover:bg-green-600/10 touch-manipulation ${
                                                    currentStatus === 'passed'
                                                        ? 'bg-green-600/20'
                                                        : 'hover:bg-muted'
                                                }`}
                                                title="Mark as Passed"
                                            >
                                                <CheckCircle className="h-3 w-3 text-green-600" />
                                            </button>
                                            <button
                                                onClick={e => {
                                                    e.stopPropagation();
                                                    handleStatusSelect(
                                                        index,
                                                        'failed',
                                                        currentStatus,
                                                        e
                                                    );
                                                    setExpandedStep(null);
                                                }}
                                                className={`p-1 rounded transition-colors hover:bg-red-600/10 touch-manipulation ${
                                                    currentStatus === 'failed'
                                                        ? 'bg-red-600/20'
                                                        : 'hover:bg-muted'
                                                }`}
                                                title="Mark as Failed"
                                            >
                                                <XCircle className="h-3 w-3 text-red-600" />
                                            </button>
                                            <button
                                                onClick={e => {
                                                    e.stopPropagation();
                                                    handleStatusSelect(
                                                        index,
                                                        'skipped',
                                                        currentStatus,
                                                        e
                                                    );
                                                    setExpandedStep(null);
                                                }}
                                                className={`p-1 rounded transition-colors hover:bg-yellow-600/10 touch-manipulation ${
                                                    currentStatus === 'skipped'
                                                        ? 'bg-yellow-600/20'
                                                        : 'hover:bg-muted'
                                                }`}
                                                title="Mark as Skipped"
                                            >
                                                <Minus className="h-3 w-3 text-yellow-600" />
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="flex-shrink-0">
                                        <StatusIcon />
                                    </div>
                                )}

                                <div
                                    className="text-sm leading-relaxed flex-1"
                                    title={step.body || step.type}
                                >
                                    {step.body || step.type}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}
