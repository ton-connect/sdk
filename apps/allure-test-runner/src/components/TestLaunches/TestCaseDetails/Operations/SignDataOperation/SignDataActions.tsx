import type { SignDataPayload } from '@tonconnect/ui-react';
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { useState } from 'react';

type SignDataActionsProps = {
    signDataPayload: SignDataPayload | undefined;
    onSignData: () => Promise<void>;
};

export function SignDataActions({ signDataPayload, onSignData }: SignDataActionsProps) {
    const [isSending, setIsSending] = useState(false);

    const wallet = useTonWallet();
    const [tonConnectUI] = useTonConnectUI();

    return wallet ? (
        <button
            onClick={async () => {
                setIsSending(true);
                try {
                    await onSignData();
                } finally {
                    setIsSending(false);
                }
            }}
            disabled={isSending || !signDataPayload}
            className="btn btn-primary transaction-btn"
        >
            {isSending ? (
                <>
                    <div className="transaction-btn__spinner"></div>
                    Signing...
                </>
            ) : (
                'Sign data'
            )}
        </button>
    ) : (
        <button
            onClick={() => tonConnectUI.openModal()}
            className="btn btn-secondary transaction-btn"
        >
            Connect Wallet & Sign Data
        </button>
    );
}
