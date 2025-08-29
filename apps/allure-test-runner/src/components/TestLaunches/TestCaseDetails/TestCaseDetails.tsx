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
import { SendTransactionAction } from './Operations/SendTransactionOperation/SendTransactionActions';
import { ValidationStatus } from './ValidationStatus';

type Props = {
    testId: number | null;
    onTestCasesRefresh?: () => void;
    onTestIdChange?: (newTestId: number) => void;
};

type SendTransactionResultProps = {
    transactionResult: Record<string, unknown> | undefined;
    isResultValid: boolean | undefined;
    validationErrors: string[];
};

export function SendTransactionResult({
    transactionResult,
    isResultValid,
    validationErrors
}: SendTransactionResultProps) {
    if (!transactionResult) {
        return null;
    }

    return (
        <>
            <TestCaseExpandableSection
                title="Transaction Result"
                // TODO: как то не джейсоницццаца
                data={JSON.stringify(transactionResult, null, 2)}
                className="transaction-result-json"
            />
            <ValidationStatus isResultValid={isResultValid} validationErrors={validationErrors} />
        </>
    );
}

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
                <SendTransactionResult
                    transactionResult={transactionResult}
                    isResultValid={isResultValid}
                    validationErrors={validationErrors}
                />
            </div>

            <TestCaseActions
                customAction={
                    <SendTransactionAction
                        isSending={isSending}
                        sendTransactionParams={sendTransactionParams}
                        onSendTransaction={handleSendTransaction}
                    />
                }
                testResult={testResult}
                isResolving={isResolving}
                isFailing={isResolving}
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
