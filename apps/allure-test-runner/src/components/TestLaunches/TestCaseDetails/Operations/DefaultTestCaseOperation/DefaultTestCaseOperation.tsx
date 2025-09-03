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
        <div className="test-case-details">
            <TestCaseInfo testResult={testResult} />

            <TestCaseActions
                testResult={testResult}
                isResolving={isResolving}
                isFailing={isFailing}
                onResolve={handleResolve}
                onFail={handleFail}
                onRerun={handleRerun}
            />
        </div>
    );
}
