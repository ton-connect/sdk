import { TestCaseExpandableSection } from '../../TestCaseExpandableSection';
import { ValidationStatus } from '../../ValidationStatus';

type SendTransactionResultProps = {
    signDataResult: Record<string, unknown> | undefined;
    isResultValid: boolean | undefined;
    validationErrors: string[];
};

export function SignDataResult({
    signDataResult,
    isResultValid,
    validationErrors
}: SendTransactionResultProps) {
    if (!signDataResult) {
        return null;
    }

    return (
        <>
            <TestCaseExpandableSection
                title="Transaction Result"
                // TODO: как то не джейсоницццаца
                data={JSON.stringify(signDataResult, null, 2)}
                className="transaction-result-json"
            />
            <ValidationStatus isResultValid={isResultValid} validationErrors={validationErrors} />
        </>
    );
}
