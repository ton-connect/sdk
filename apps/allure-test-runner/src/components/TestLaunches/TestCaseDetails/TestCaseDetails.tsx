import { TestCaseHeader } from './TestCaseHeader';
import { TestCaseDescription } from './TestCaseDescription';
import { TestCaseExpandableSection } from './TestCaseExpandableSection';
import { TestCaseActions } from './TestCaseActions';
import { TestCaseStates } from './TestCaseStates';
import { FailModal } from './FailModal';
import { OperationTypeField } from './OperationTypeField';

import { useTestCaseDetails } from './hooks';
import './TestCaseDetails.scss';
import { useTransactionValidation } from './hooks/useTransactionValidation';
import { ValidationStatus } from './ValidationStatus';

type Props = {
    testId: number | null;
    onTestCasesRefresh?: () => void;
    onTestIdChange?: (newTestId: number) => void;
};

export function TestCaseDetails({ testId, onTestCasesRefresh, onTestIdChange }: Props) {
    const {
        testResult,
        loading,
        isSwitching,
        isResolving,
        isFailing,
        handleResolve,
        handleFail,
        handleRerun,
        validationErrors,
        setValidationErrors,
        showFailModal,
        setShowFailModal,
        testResultWithCustomFields
    } = useTestCaseDetails(testId, onTestCasesRefresh, onTestIdChange);

    const {
        isResultValid,
        transactionResult,
        handleSendTransaction,
        isSending,
        sendTransactionParams
    } = useTransactionValidation({
        testResult,
        setValidationErrors,
        setShowFailModal,
        handleResolve
    });

    const stateComponent = TestCaseStates({
        testId,
        isSwitching,
        loading,
        hasResult: !!testResult
    });
    if (stateComponent) {
        return stateComponent;
    }

    if (!testResult) {
        return null;
    }

    return (
        <div className="test-case-details">
            <div className="test-case-details__content">
                <TestCaseHeader
                    name={testResult.name}
                    status={testResult.status}
                    message={testResult.message}
                />
                <OperationTypeField
                    operationType={testResultWithCustomFields?.customFields?.operationType}
                />
                <TestCaseDescription
                    description={testResult.description}
                    descriptionHtml={testResult.descriptionHtml}
                />
                <TestCaseExpandableSection
                    title="Precondition"
                    data={testResult.precondition}
                    dataHtml={testResult.preconditionHtml}
                />
                <TestCaseExpandableSection
                    title="Expected Result"
                    data={testResult.expectedResult}
                    dataHtml={testResult.expectedResultHtml}
                />
                {/*TODO: extract*/}
                {transactionResult && (
                    <>
                        <TestCaseExpandableSection
                            title="Transaction Result"
                            // TODO: как то не джейсоницццаца
                            data={JSON.stringify(transactionResult, null, 2)}
                            className="transaction-result-json"
                        />
                        <ValidationStatus
                            isResultValid={isResultValid}
                            validationErrors={validationErrors}
                        />
                    </>
                )}
            </div>

            <TestCaseActions
                testResult={testResult}
                sendTransactionParams={sendTransactionParams}
                isSending={isSending}
                isResolving={isResolving}
                isFailing={isResolving}
                onSendTransaction={handleSendTransaction}
                onResolve={handleResolve}
                onFail={handleFail}
                onRerun={handleRerun}
            />

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
