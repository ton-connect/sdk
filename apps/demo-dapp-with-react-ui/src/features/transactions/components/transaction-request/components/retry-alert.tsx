import { AlertTriangle, Info } from 'lucide-react';

import { Button } from '../../../../../core/components/ui/button';

import type { RetryPrompt } from '../hooks';

interface RetryAlertProps {
    prompt: RetryPrompt;
    onRetry: () => void;
    onDismiss: () => void;
}

export const RetryAlert = ({ prompt, onRetry, onDismiss }: RetryAlertProps) => {
    const dangerous = prompt.dispatched;
    const subject = prompt.kind === 'sendTx' ? 'transaction' : 'message';

    return (
        <div
            className={`flex flex-col gap-3 rounded-md border p-3 text-sm ${
                dangerous
                    ? 'border-error/40 bg-error/10 text-error'
                    : 'border-primary/30 bg-primary/10 text-foreground'
            }`}
            data-testid="tx-request-retry-alert"
            data-dispatched={dangerous ? 'true' : 'false'}
            data-kind={prompt.kind}
        >
            <div className="flex items-center gap-2 font-semibold">
                {dangerous ? (
                    <AlertTriangle className="size-4 shrink-0" />
                ) : (
                    <Info className="size-4 shrink-0" />
                )}
                {dangerous ? 'Possible duplicate' : 'Request not delivered'}
            </div>
            <p className="leading-relaxed">
                {dangerous ? (
                    <>
                        The {subject} was delivered to the wallet inside the connect URL, but no
                        response came back. The wallet may have already processed it. Check your
                        wallet history (or the destination address on-chain) before retrying — a
                        blind retry can result in a duplicate {subject}.
                    </>
                ) : (
                    <>
                        The wallet connected but did not receive the request. It is safe to send it
                        again over the bridge.
                    </>
                )}
            </p>
            <div className="flex flex-wrap gap-2">
                <Button size="s" onClick={onRetry} data-testid="tx-request-retry-button">
                    Retry {prompt.kind === 'sendTx' ? 'transaction' : 'message signing'}
                </Button>
                <Button
                    size="s"
                    variant="ghost"
                    onClick={onDismiss}
                    data-testid="tx-request-retry-dismiss-button"
                >
                    Dismiss
                </Button>
            </div>
        </div>
    );
};
