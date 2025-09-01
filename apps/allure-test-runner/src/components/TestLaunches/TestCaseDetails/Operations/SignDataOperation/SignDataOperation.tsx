import { SignDataResult } from './SignDataResult';
import { useTestCaseDetails } from '../../hooks';
import { TestCaseInfo } from '../../TestCaseInfo';
import { TestCaseActions } from '../../TestCaseActions';
import { FailModal } from '../../FailModal';
import type { TestResultWithCustomFields } from '../../../../../models';
import { useSignDataValidation } from './hooks/useSignDataValidation';
import { SignDataActions } from './SignDataActions';

type SignDataOperationProps = {
    testResult: TestResultWithCustomFields;
    refetchTestResult?: () => void;
    onTestCasesRefresh?: () => void;
    onTestIdChange?: (newTestId: number) => void;
};

export function SignDataOperation({
    testResult,
    refetchTestResult,
    onTestCasesRefresh,
    onTestIdChange
}: SignDataOperationProps) {
    const {
        isResolving,
        isFailing,
        handleResolve,
        handleFail,
        handleRerun,
        validationErrors,
        setValidationErrors,
        showFailModal,
        setShowFailModal
    } = useTestCaseDetails(testResult, refetchTestResult, onTestCasesRefresh, onTestIdChange);

    const { isResultValid, signDataResult, handleSignData, signDataPayload } =
        useSignDataValidation({
            testResult,
            setValidationErrors,
            setShowFailModal,
            handleResolve
        });

    if (!testResult) {
        return null;
    }

    return (
        <div className="test-case-details">
            <TestCaseInfo testResult={testResult}>
                <SignDataResult
                    signDataResult={signDataResult}
                    isResultValid={isResultValid}
                    validationErrors={validationErrors}
                />
            </TestCaseInfo>
            <TestCaseActions
                testResult={testResult}
                isResolving={isResolving}
                isFailing={isResolving}
                onResolve={handleResolve}
                onFail={handleFail}
                onRerun={handleRerun}
            >
                <SignDataActions signDataPayload={signDataPayload} onSignData={handleSignData} />
            </TestCaseActions>

            <FailModal
                isOpen={showFailModal}
                onClose={() => setShowFailModal(false)}
                onSubmit={handleFail}
                isSubmitting={isFailing}
                initialMessage={validationErrors.join('\n')}
            />
        </div>
    );
}
