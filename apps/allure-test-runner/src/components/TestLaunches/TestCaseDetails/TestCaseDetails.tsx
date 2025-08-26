import { useMemo, useState, useEffect } from 'react';
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import type { TestResult } from '../../../models';
import { useAllureApi } from '../../../hooks/useAllureApi';
import { useQuery } from '../../../hooks/useQuery';
import { tryParseJson } from '../../../utils/parse-json';
import { StatusLabel } from '../StatusLabel/StatusLabel';
import './TestCaseDetails.scss';

interface TransactionData {
    validUntil: number;
    messages: Array<{
        address: string;
        amount: string;
        stateInit?: string;
        payload?: string;
    }>;
}

type Props = {
    testId: number | null;
};

export function TestCaseDetails({ testId }: Props) {
    const client = useAllureApi();
    const [tonConnectUI] = useTonConnectUI();
    const wallet = useTonWallet();
    const [transactionResult, setTransactionResult] = useState<string | null>(null);
    const [isSending, setIsSending] = useState(false);
    const [isSwitching, setIsSwitching] = useState(false);
    const [expandedPrecondition, setExpandedPrecondition] = useState(true);
    const [expandedExpectedResult, setExpandedExpectedResult] = useState(true);
    const [expandedTransactionResult, setExpandedTransactionResult] = useState(true);

    const { loading, result } = useQuery<TestResult | undefined>(
        signal => (testId ? client.getTestResult(testId, signal) : Promise.resolve(undefined)),
        { deps: [client, testId] }
    );

    const parsedPre = useMemo(() => {
        const parsed = tryParseJson(result?.precondition);
        return parsed &&
            typeof parsed === 'object' &&
            'validUntil' in parsed &&
            'messages' in parsed
            ? (parsed as TransactionData)
            : null;
    }, [result]);

    const parsedExpected = useMemo(() => tryParseJson(result?.expectedResult), [result]);

    useEffect(() => {
        if (testId) {
            setIsSwitching(true);
            setTransactionResult(null);
        }
    }, [testId]);

    useEffect(() => {
        if (result) {
            setIsSwitching(false);
        }
    }, [result]);

    if (!testId) {
        return (
            <div className="test-case-details__empty">
                <div className="test-case-details__empty-icon">📋</div>
                <div className="test-case-details__empty-text">Select a test to view details</div>
            </div>
        );
    }

    if (isSwitching || (loading && !result)) {
        return (
            <div className="test-case-details__loading">
                <div className="test-case-details__loading-spinner"></div>
                <div className="test-case-details__loading-text">Loading test details...</div>
            </div>
        );
    }

    if (!result) {
        return (
            <div className="test-case-details__empty">
                <div className="test-case-details__empty-icon">❌</div>
                <div className="test-case-details__empty-text">No details available</div>
            </div>
        );
    }

    const getStatusText = (status?: 'unknown' | 'passed' | 'failed') => {
        switch (status) {
            case 'passed':
                return 'Passed';
            case 'failed':
                return 'Failed';
            case 'unknown':
                return 'Unknown';
            default:
                return 'In Progress';
        }
    };

    const handleSendTransaction = async () => {
        if (!parsedPre) {
            setTransactionResult(
                JSON.stringify(
                    {
                        error: 'No precondition data available',
                        timestamp: new Date().toISOString()
                    },
                    null,
                    2
                )
            );
            return;
        }

        try {
            setIsSending(true);
            setTransactionResult(null);

            const transaction = {
                validUntil: Math.floor(Date.now() / 1000) + 300,
                messages: parsedPre.messages
            };

            const result = await tonConnectUI.sendTransaction(transaction);
            setTransactionResult(
                JSON.stringify(
                    {
                        success: true,
                        message: 'Transaction sent successfully',
                        result: result,
                        timestamp: new Date().toISOString(),
                        transaction: transaction
                    },
                    null,
                    2
                )
            );
        } catch (error) {
            setTransactionResult(
                JSON.stringify(
                    {
                        success: false,
                        error: error instanceof Error ? error.message : 'Unknown error',
                        timestamp: new Date().toISOString(),
                        transaction: {
                            validUntil: Math.floor(Date.now() / 1000) + 300,
                            messages: parsedPre.messages
                        }
                    },
                    null,
                    2
                )
            );
        } finally {
            setIsSending(false);
        }
    };

    return (
        <div className="test-case-details">
            <div className="test-case-details__content">
                <div className="test-case-details-name">
                    <h3 className="test-case-details-name-title">{result.name}</h3>
                </div>

                <div className="test-case-details-header">
                    <div className="test-case-details-status-label">Status:</div>
                    <div className="test-case-details-status">
                        <StatusLabel status={result.status} />
                    </div>
                    <div className="test-case-details-status-text">
                        {getStatusText(result.status)}
                    </div>
                </div>

                {result.description && (
                    <div className="test-case-section">
                        <div className="test-case-section-header-static">
                            <h4 className="test-case-section-title">Description</h4>
                        </div>
                        <div className="test-case-content">
                            {result.descriptionHtml ? (
                                <div dangerouslySetInnerHTML={{ __html: result.descriptionHtml }} />
                            ) : (
                                <div className="text-block">{result.description}</div>
                            )}
                        </div>
                    </div>
                )}

                <div className="test-case-section">
                    <button
                        className="test-case-section-header"
                        onClick={() => setExpandedPrecondition(!expandedPrecondition)}
                    >
                        <h4 className="test-case-section-title">Precondition</h4>
                        <span
                            className={`test-case-section-toggle ${expandedPrecondition ? 'expanded' : ''}`}
                        ></span>
                    </button>
                    {expandedPrecondition && (
                        <div className="test-case-content">
                            <div className="json-block">
                                <pre>{parsedPre ? JSON.stringify(parsedPre, null, 2) : '—'}</pre>
                            </div>
                        </div>
                    )}
                </div>

                <div className="test-case-section">
                    <button
                        className="test-case-section-header"
                        onClick={() => setExpandedExpectedResult(!expandedExpectedResult)}
                    >
                        <h4 className="test-case-section-title">Expected Result</h4>
                        <span
                            className={`test-case-section-toggle ${expandedExpectedResult ? 'expanded' : ''}`}
                        ></span>
                    </button>
                    {expandedExpectedResult && (
                        <div className="test-case-content">
                            <div className="json-block">
                                <pre>
                                    {parsedExpected ? JSON.stringify(parsedExpected, null, 2) : '—'}
                                </pre>
                            </div>
                        </div>
                    )}
                </div>

                {transactionResult && (
                    <div className="test-case-section">
                        <button
                            className="test-case-section-header"
                            onClick={() => setExpandedTransactionResult(!expandedTransactionResult)}
                        >
                            <h4 className="test-case-section-title">Transaction Result</h4>
                            <span
                                className={`test-case-section-toggle ${expandedTransactionResult ? 'expanded' : ''}`}
                            ></span>
                        </button>
                        {expandedTransactionResult && (
                            <div className="test-case-content">
                                <div className="transaction-result-json">
                                    <pre>{transactionResult}</pre>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            <div className="test-case-details__actions">
                {wallet ? (
                    <button
                        onClick={handleSendTransaction}
                        disabled={isSending || !parsedPre}
                        className="btn btn-primary transaction-btn"
                    >
                        {isSending ? (
                            <>
                                <div className="transaction-btn__spinner"></div>
                                Sending...
                            </>
                        ) : (
                            'Send Transaction with Precondition Data'
                        )}
                    </button>
                ) : (
                    <button
                        onClick={() => tonConnectUI.connectWallet()}
                        className="btn btn-secondary transaction-btn"
                    >
                        Connect Wallet & Send Transaction
                    </button>
                )}
                {!parsedPre && (
                    <div className="test-case-note">
                        Note: Precondition data is required to send transaction
                    </div>
                )}
            </div>
        </div>
    );
}
