import type { SendTransactionRequest } from '@tonconnect/ui-react';
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { useState } from 'react';
import { Button } from '../../../../ui/button';
import { Loader2, Send, Wifi } from 'lucide-react';

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
        <div className="space-y-2">
            {wallet ? (
                <Button
                    onClick={() => {
                        setIsSending(true);
                        onSendTransaction().finally(() => setIsSending(false));
                    }}
                    disabled={isSending || !sendTransactionParams}
                    variant="default"
                    size="sm"
                    className="w-full"
                >
                    {isSending ? (
                        <>
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            Sending transaction...
                        </>
                    ) : (
                        <>
                            <Send className="h-3 w-3 mr-1" />
                            Send Transaction
                        </>
                    )}
                </Button>
            ) : (
                <Button
                    onClick={() => tonConnectUI.openModal()}
                    variant="default"
                    size="sm"
                    className="w-full"
                >
                    <Wifi className="h-3 w-3 mr-1" />
                    Connect & Send
                </Button>
            )}

            {onToggleWaitForTx && (
                <div className="p-2 bg-muted/30 border border-border/50 rounded text-xs">
                    <label className="flex items-center gap-2 cursor-pointer select-none">
                        <input
                            type="checkbox"
                            checked={!!waitForTx}
                            onChange={e => onToggleWaitForTx(e.target.checked)}
                            className="h-3 w-3 rounded border border-input bg-background text-primary focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                        />
                        <span className="text-foreground font-medium">
                            Wait for transaction confirmation
                        </span>
                    </label>
                    <p className="text-muted-foreground text-xs mt-1 ml-5">
                        Test will wait until transaction is confirmed on blockchain
                    </p>
                </div>
            )}
        </div>
    );
}
