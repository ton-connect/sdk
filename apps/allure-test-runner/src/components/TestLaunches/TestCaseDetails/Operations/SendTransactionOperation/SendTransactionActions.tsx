import type { SendTransactionRequest } from '@tonconnect/sdk';
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { useState } from 'react';

type SendTransactionActionProps = {
    sendTransactionParams: SendTransactionRequest | undefined;
    onSendTransaction: () => Promise<void>;
};

export function SendTransactionAction({
    sendTransactionParams,
    onSendTransaction
}: SendTransactionActionProps) {
    const wallet = useTonWallet();
    const [tonConnectUI] = useTonConnectUI();
    const [isSending, setIsSending] = useState(false);

    return wallet ? (
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
    );
}
