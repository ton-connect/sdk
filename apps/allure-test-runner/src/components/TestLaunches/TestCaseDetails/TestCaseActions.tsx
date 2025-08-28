import { useState } from 'react';
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import type { SendTransactionRequest } from '@tonconnect/ui-react';
import { FailModal } from './FailModal';
import type { TestResult } from '../../../models';

type Props = {
    testResult: TestResult | undefined;
    sendTransactionParams: SendTransactionRequest | undefined;

    isSending: boolean;
    isResolving: boolean;
    isFailing: boolean;

    onSendTransaction: () => void;
    onResolve: () => void;
    onFail: (message: string) => void;
    onRerun: () => void;
};

export function TestCaseActions({
    testResult,
    sendTransactionParams,
    isSending,
    isResolving,
    isFailing,
    onSendTransaction,
    onResolve,
    onFail,
    onRerun
}: Props) {
    const wallet = useTonWallet();
    const [tonConnectUI] = useTonConnectUI();
    const [isFailModalOpen, setIsFailModalOpen] = useState(false);

    const handleFailSubmit = (message: string) => {
        onFail(message);
        setIsFailModalOpen(false);
    };

    const isStatusFinal = testResult?.status === 'passed' || testResult?.status === 'failed';

    return (
        <>
            <div className="test-case-details__actions">
                {wallet ? (
                    <button
                        onClick={onSendTransaction}
                        disabled={isSending || !sendTransactionParams}
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
                        onClick={() => tonConnectUI.openModal()}
                        className="btn btn-secondary transaction-btn"
                    >
                        Connect Wallet & Send Transaction
                    </button>
                )}

                {!isStatusFinal && (
                    <>
                        <button
                            onClick={onResolve}
                            disabled={isResolving || !testResult}
                            className="btn btn-success"
                            style={{ marginLeft: 4 }}
                        >
                            {isResolving ? 'Resolving…' : 'Passed'}
                        </button>

                        <button
                            onClick={() => setIsFailModalOpen(true)}
                            disabled={isFailing || !testResult}
                            className="btn btn-danger"
                            style={{ marginLeft: 4 }}
                        >
                            {isFailing ? 'Marking as Failed...' : 'Failed'}
                        </button>
                    </>
                )}

                {isStatusFinal && (
                    <button
                        // TODO: fixme button not reloading states tata ta tat tat (TREE VIEW!!!!)
                        onClick={onRerun}
                        disabled={!testResult}
                        className="btn btn-secondary"
                        style={{ marginLeft: 4 }}
                    >
                        Rerun
                    </button>
                )}
            </div>

            <FailModal
                isOpen={isFailModalOpen}
                onClose={() => setIsFailModalOpen(false)}
                onSubmit={handleFailSubmit}
                isSubmitting={isFailing}
            />
        </>
    );
}
