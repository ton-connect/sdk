import { TestCaseHeader } from './TestCaseHeader';
import { TestCaseDescription } from './TestCaseDescription';
import { TestCaseJsonSection } from './TestCaseJsonSection';
import { TestCaseActions } from './TestCaseActions';
import { TestCaseStates } from './TestCaseStates';
import { FailModal } from './FailModal';

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
        handleRerun,
        isFailing,
        togglePrecondition,
        toggleExpectedResult,
        toggleTransactionResult,
        isResultValid,
        validationErrors,
        showFailModal,
        setShowFailModal
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
                        <div className="validation-status">
                            <div
                                className={`validation-status__indicator ${isResultValid ? 'valid' : 'invalid'}`}
                            >
                                {isResultValid ? '✓ VALID' : '✗ NOT VALID'}
                            </div>
                            {!isResultValid && validationErrors.length > 0 && (
                                <div className="validation-errors">
                                    <h4 className="validation-errors__title">Validation Errors:</h4>
                                    <div className="validation-errors__list">
                                        {validationErrors.map((error, index) => (
                                            <div key={index} className="validation-errors__item">
                                                <span className="validation-errors__icon">⚠️</span>
                                                <span className="validation-errors__text">
                                                    {error}
                                                </span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
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
