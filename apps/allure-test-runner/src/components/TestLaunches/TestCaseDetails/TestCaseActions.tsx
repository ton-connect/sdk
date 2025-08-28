import { useState } from 'react';
import type { TonConnectUI } from '@tonconnect/ui-react';
import { FailModal } from './FailModal';

type Props = {
    wallet: { account: { address: string } } | null;
    tonConnectUI: TonConnectUI;
    isSending: boolean;
    isResolving: boolean;
    isFailing: boolean;
    hasPrecondition: boolean;
    hasResult: boolean;
    status?: 'unknown' | 'passed' | 'failed';
    onSendTransaction: () => void;
    onResolve: () => void;
    onFail: (message: string) => void;
    onRerun: () => void;
};

export function TestCaseActions({
    wallet,
    tonConnectUI,
    isSending,
    isResolving,
    isFailing,
    hasPrecondition,
    hasResult,
    status,
    onSendTransaction,
    onResolve,
    onFail,
    onRerun
}: Props) {
    const [isFailModalOpen, setIsFailModalOpen] = useState(false);

    const handleFailSubmit = (message: string) => {
        onFail(message);
        setIsFailModalOpen(false);
    };

    const isStatusFinal = status === 'passed' || status === 'failed';

    return (
        <>
            <div className="test-case-details__actions">
                {wallet ? (
                    <button
                        onClick={onSendTransaction}
                        disabled={isSending || !hasPrecondition}
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

                {!isStatusFinal && (
                    <>
                        <button
                            onClick={onResolve}
                            disabled={isResolving || !hasResult}
                            className="btn btn-success"
                            style={{ marginLeft: 4 }}
                        >
                            {isResolving ? 'Resolving…' : 'Passed'}
                        </button>

                        <button
                            onClick={() => setIsFailModalOpen(true)}
                            disabled={isFailing || !hasResult}
                            className="btn btn-danger"
                            style={{ marginLeft: 4 }}
                        >
                            {isFailing ? 'Marking as Failed...' : 'Failed'}
                        </button>
                    </>
                )}

                {isStatusFinal && (
                    <button
                        onClick={onRerun}
                        disabled={!hasResult}
                        className="btn btn-secondary"
                        style={{ marginLeft: 4 }}
                    >
                        Rerun
                    </button>
                )}

                {!hasPrecondition && (
                    <div className="test-case-note">
                        Note: Precondition data is required to send transaction
                    </div>
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
