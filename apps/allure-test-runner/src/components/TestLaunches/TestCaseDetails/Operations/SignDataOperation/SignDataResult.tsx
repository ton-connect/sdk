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
                data={JSON.stringify(signDataResult, null, 2)}
            />
            <ValidationStatus isResultValid={isResultValid} validationErrors={validationErrors} />
        </>
    );
}
