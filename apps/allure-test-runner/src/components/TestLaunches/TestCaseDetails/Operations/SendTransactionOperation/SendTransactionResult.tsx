import { TestCaseExpandableSection } from '../../TestCaseExpandableSection';
import { ValidationStatus } from '../../ValidationStatus';

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
