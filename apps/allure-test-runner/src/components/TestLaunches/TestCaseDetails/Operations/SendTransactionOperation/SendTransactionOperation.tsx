import { useTransactionValidation } from './hooks/useTransactionValidation';
import { SendTransactionResult } from './SendTransactionResult';
import { SendTransactionAction } from './SendTransactionActions';
import { useTestCaseDetails } from '../../hooks';
import { TestCaseInfo } from '../../TestCaseInfo';
import { TestCaseActions } from '../../TestCaseActions';
import { FailModal } from '../../FailModal';
import type { TestResultWithCustomFields } from '../../../../../models';
import { useState } from 'react';

type SendTransactionOperationProps = {
    testResult: TestResultWithCustomFields;
    refetchTestResult?: () => void;
    onTestCasesRefresh?: () => void;
    onTestIdChange?: (newTestId: number) => void;
};

export function SendTransactionOperation({
    testResult,
    refetchTestResult,
    onTestCasesRefresh,
    onTestIdChange
}: SendTransactionOperationProps) {
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

    const [waitForTx, setWaitForTx] = useState(false);

    const {
        isResultValid,
        transactionResult,
        handleSendTransaction,
        sendTransactionParams,
        explorerUrl,
        isWaitingForTx
    } = useTransactionValidation({
        testResult,
        setValidationErrors,
        setShowFailModal,
        handleResolve,
        waitForTx
    });

    if (!testResult) {
        return null;
    }

    return (
        <div className="test-case-details">
            <TestCaseInfo testResult={testResult}>
                <SendTransactionResult
                    transactionResult={transactionResult}
                    explorerUrl={explorerUrl}
                    isWaitingForTx={isWaitingForTx}
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
                    sendTransactionParams={sendTransactionParams}
                    onSendTransaction={handleSendTransaction}
                    waitForTx={waitForTx}
                    onToggleWaitForTx={setWaitForTx}
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
