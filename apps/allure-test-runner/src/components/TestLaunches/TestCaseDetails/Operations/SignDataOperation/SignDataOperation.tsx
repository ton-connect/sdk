import { SignDataResult } from './SignDataResult';
import { useTestCaseDetails } from '../../hooks';
import { TestCaseInfo } from '../../TestCaseInfo';
import { TestCaseActions } from '../../TestCaseActions';
import { StatusModal } from '../../StatusModal/StatusModal';
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
        showStatusModal,
        statusModalInitialStatus,
        statusModalMessage,
        showValidationModal,
        handleStatusModalSubmit,
        setShowStatusModal
    } = useTestCaseDetails(testResult, refetchTestResult, onTestCasesRefresh, onTestIdChange);

    const { isResultValid, signDataResult, handleSignData, signDataPayload } =
        useSignDataValidation({
            testResult,
            setValidationErrors,
            showValidationModal,
            setShowStatusModal
        });

    if (!testResult) {
        return null;
    }

    return (
        <div className="h-full flex flex-col bg-background overflow-hidden">
            <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">
                <TestCaseInfo testResult={testResult}>
                    <SignDataResult
                        signDataResult={signDataResult}
                        isResultValid={isResultValid}
                        validationErrors={validationErrors}
                    />
                </TestCaseInfo>
            </div>

            <div className="flex-shrink-0 border-t border-border bg-background">
                <TestCaseActions
                    testResult={testResult}
                    isResolving={isResolving}
                    isFailing={isResolving}
                    onResolve={handleResolve}
                    onFail={handleFail}
                    onRerun={handleRerun}
                >
                    <SignDataActions
                        signDataPayload={signDataPayload}
                        onSignData={handleSignData}
                    />
                </TestCaseActions>
            </div>

            <StatusModal
                isOpen={showStatusModal}
                onClose={() => setShowStatusModal(false)}
                onSubmit={handleStatusModalSubmit}
                initialStatus={statusModalInitialStatus}
                initialReason={statusModalMessage}
                isSubmitting={isResolving || isFailing}
            />
        </div>
    );
}
