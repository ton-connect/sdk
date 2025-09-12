import type { SignDataPayload } from '@tonconnect/ui-react';
import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { useState } from 'react';
import { Button } from '../../../../ui/button';
import { Loader2, PenTool, Wifi } from 'lucide-react';

type SignDataActionsProps = {
    signDataPayload: SignDataPayload | undefined;
    onSignData: () => Promise<void>;
};

export function SignDataActions({ signDataPayload, onSignData }: SignDataActionsProps) {
    const [isSending, setIsSending] = useState(false);

    const wallet = useTonWallet();
    const [tonConnectUI] = useTonConnectUI();

    return (
        <div>
            {wallet ? (
                <Button
                    onClick={async () => {
                        setIsSending(true);
                        try {
                            await onSignData();
                        } finally {
                            setIsSending(false);
                        }
                    }}
                    disabled={isSending || !signDataPayload}
                    variant="default"
                    size="sm"
                    className="w-full"
                >
                    {isSending ? (
                        <>
                            <Loader2 className="h-3 w-3 mr-1 animate-spin" />
                            Signing data...
                        </>
                    ) : (
                        <>
                            <PenTool className="h-3 w-3 mr-1" />
                            Sign Data
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
                    Connect & Sign
                </Button>
            )}
        </div>
    );
}
