import { TestCaseActions } from './TestCaseActions';
import { TestCaseStates } from './TestCaseStates';
import { FailModal } from './FailModal';

import { useTestCaseDetails } from './hooks';
import './TestCaseDetails.scss';
import { useTransactionValidation } from './hooks/useTransactionValidation';
import { SendTransactionAction } from './Operations/SendTransactionOperation/SendTransactionActions';
import { SendTransactionResult } from './Operations/SendTransactionOperation/SendTransactionResult';
import { TestCaseInfo } from './TestCaseInfo';

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
        setShowFailModal
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
            <TestCaseInfo testResult={testResult}>
                <SendTransactionResult
                    transactionResult={transactionResult}
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
                <SendTransactionAction
                    isSending={isSending}
                    sendTransactionParams={sendTransactionParams}
                    onSendTransaction={handleSendTransaction}
                />
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
