import { TestCaseExpandableSection } from '../../TestCaseExpandableSection';
import { ValidationStatus } from '../../ValidationStatus';
import { Loader } from '../../../Loader';

type SendTransactionResultProps = {
    transactionResult?: Record<string, unknown> | undefined;
    isResultValid: boolean | undefined;
    validationErrors: string[];
    explorerUrl?: string | null;
    isWaitingForTx?: boolean;
};

export function SendTransactionResult({
    transactionResult,
    isResultValid,
    validationErrors,
    explorerUrl,
    isWaitingForTx
}: SendTransactionResultProps) {
    if (!isWaitingForTx && !explorerUrl && !transactionResult) return null;

    return (
        <>
            {transactionResult && (
                <TestCaseExpandableSection
                    title="Transaction Result"
                    data={JSON.stringify(transactionResult, null, 2)}
                    className="transaction-result-json"
                />
            )}

            {isWaitingForTx && (
                <div style={{ margin: '8px 0 0 2px' }}>
                    <Loader size="small" text="Waiting for transaction confirmation..." />
                </div>
            )}

            {explorerUrl && (
                <div style={{ margin: '8px 0 0 2px' }}>
                    <a href={explorerUrl} target="_blank" rel="noreferrer" className="link-light">
                        View transaction in TON Viewer
                    </a>
                </div>
            )}

            <ValidationStatus isResultValid={isResultValid} validationErrors={validationErrors} />
        </>
    );
}
