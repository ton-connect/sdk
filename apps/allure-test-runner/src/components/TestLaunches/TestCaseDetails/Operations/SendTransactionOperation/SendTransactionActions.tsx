import type { SendTransactionRequest } from '@tonconnect/sdk';
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';

type SendTransactionActionProps = {
    isSending: boolean;
    sendTransactionParams: SendTransactionRequest | undefined;
    onSendTransaction: () => void;
};

export function SendTransactionAction({
    sendTransactionParams,
    isSending,
    onSendTransaction
}: SendTransactionActionProps) {
    const wallet = useTonWallet();
    const [tonConnectUI] = useTonConnectUI();

    return wallet ? (
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
    );
}
