import { TestCaseHeader } from './TestCaseHeader';
import { TestCaseDescription } from './TestCaseDescription';
import { TestCaseJsonSection } from './TestCaseJsonSection';
import { TestCaseActions } from './TestCaseActions';
import { TestCaseStates } from './TestCaseStates';
import { useTestCaseDetails } from './hooks';
import './TestCaseDetails.scss';

type Props = {
    testId: number | null;
    onTestCasesRefresh?: () => void;
};

export function TestCaseDetails({ testId, onTestCasesRefresh }: Props) {
    const {
        result,
        loading,
        isSwitching,
        isSending,
        isResolving,
        transactionResult,
        parsedPre,
        parsedExpected,
        expandedPrecondition,
        expandedExpectedResult,
        expandedTransactionResult,
        wallet,
        tonConnectUI,
        handleSendTransaction,
        handleResolve,
        handleFail,
        togglePrecondition,
        toggleExpectedResult,
        toggleTransactionResult,
        isResultValid,
        errors
    } = useTestCaseDetails(testId, onTestCasesRefresh);

    const stateComponent = TestCaseStates({ testId, isSwitching, loading, hasResult: !!result });
    if (stateComponent) {
        return stateComponent;
    }

    if (!result) {
        return null;
    }

    return (
        <div className="test-case-details">
            <div className="test-case-details__content">
                <TestCaseHeader
                    name={result.name}
                    status={result.status}
                    message={result.message}
                />

                <TestCaseDescription
                    description={result.description}
                    descriptionHtml={result.descriptionHtml}
                />

                <TestCaseJsonSection
                    title="Precondition"
                    isExpanded={expandedPrecondition}
                    onToggle={togglePrecondition}
                    data={parsedPre}
                />

                <TestCaseJsonSection
                    title="Expected Result"
                    isExpanded={expandedExpectedResult}
                    onToggle={toggleExpectedResult}
                    data={parsedExpected}
                />

                {transactionResult && (
                    <>
                        <TestCaseJsonSection
                            title="Transaction Result"
                            isExpanded={expandedTransactionResult}
                            onToggle={toggleTransactionResult}
                            data={transactionResult}
                            className="transaction-result-json"
                        />
                        <div>
                            {isResultValid ? 'VALID' : 'NOT VALID'} {errors.join('\n')}
                        </div>
                    </>
                )}
            </div>

            <TestCaseActions
                wallet={wallet}
                tonConnectUI={tonConnectUI}
                isSending={isSending}
                isResolving={isResolving}
                isFailing={isResolving}
                hasPrecondition={!!parsedPre}
                hasResult={!!result}
                status={result.status}
                onSendTransaction={handleSendTransaction}
                onResolve={handleResolve}
                onFail={handleFail}
            />
        </div>
    );
}
