import { useTestCaseDetails } from '../../hooks/useTestCaseDetails';
import { TestCaseInfo } from '../../TestCaseInfo';
import { TestCaseActions } from '../../TestCaseActions';
import type { TestResultWithCustomFields } from '../../../../../models';

type DefaultTestCaseOperationProps = {
    testResult: TestResultWithCustomFields;
    refetchTestResult?: () => void;
    onTestCasesRefresh?: () => void;
    onTestIdChange?: (newTestId: number) => void;
};

export function DefaultTestCaseOperation({
    testResult,
    refetchTestResult,
    onTestCasesRefresh,
    onTestIdChange
}: DefaultTestCaseOperationProps) {
    const { isResolving, isFailing, handleResolve, handleFail, handleRerun } = useTestCaseDetails(
        testResult,
        refetchTestResult,
        onTestCasesRefresh,
        onTestIdChange
    );

    return (
        <div className="h-full flex flex-col bg-background overflow-hidden">
            <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">
                <TestCaseInfo testResult={testResult} />
            </div>

            <div className="flex-shrink-0 border-t border-border bg-background">
                <TestCaseActions
                    testResult={testResult}
                    isResolving={isResolving}
                    isFailing={isFailing}
                    onResolve={handleResolve}
                    onFail={handleFail}
                    onRerun={handleRerun}
                />
            </div>
        </div>
    );
}
