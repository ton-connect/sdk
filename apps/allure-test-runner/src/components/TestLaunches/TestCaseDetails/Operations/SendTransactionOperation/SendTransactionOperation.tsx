import { TestCaseDetails } from '../../TestCaseDetails';
import { useTransactionValidation } from '../../hooks/useTransactionValidation';
import { SendTransactionResult } from './SendTransactionResult';
import { SendTransactionAction } from './SendTransactionActions';

export function SendTransactionOperation() {
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

    return (
        <TestCaseDetails
            customDetails={
                <SendTransactionResult
                    transactionResult={transactionResult}
                    isResultValid={isResultValid}
                    validationErrors={validationErrors}
                />
            }
            customAction={
                <SendTransactionAction
                    isSending={isSending}
                    sendTransactionParams={sendTransactionParams}
                    onSendTransaction={handleSendTransaction}
                />
            }
        />
    );
}
