import type { SendTransactionRequest } from '@tonconnect/ui-react';
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { useState } from 'react';

type SendTransactionActionProps = {
    sendTransactionParams: SendTransactionRequest | undefined;
    onSendTransaction: () => Promise<void>;
    waitForTx?: boolean;
    onToggleWaitForTx?: (value: boolean) => void;
};

export function SendTransactionAction({
    sendTransactionParams,
    onSendTransaction,
    waitForTx,
    onToggleWaitForTx
}: SendTransactionActionProps) {
    const wallet = useTonWallet();
    const [tonConnectUI] = useTonConnectUI();
    const [isSending, setIsSending] = useState(false);

    return (
        <div className="send-transaction-with-options">
            {wallet ? (
                <button
                    onClick={() => {
                        setIsSending(true);
                        onSendTransaction().finally(() => setIsSending(false));
                    }}
                    disabled={isSending || !sendTransactionParams}
                    className="btn btn-primary transaction-btn"
                >
                    {isSending ? (
                        <>
                            <div className="transaction-btn__spinner"></div>
                            Sending...
                        </>
                    ) : (
                        'Send Transaction'
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

            <label style={{ userSelect: 'none' }}>
                <input
                    type="checkbox"
                    checked={!!waitForTx}
                    onChange={e => onToggleWaitForTx?.(e.target.checked)}
                    style={{ marginRight: 6 }}
                />
                Wait for transaction confirmation
            </label>
        </div>
    );
}
