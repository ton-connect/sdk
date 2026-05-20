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

    return (
        <div
            className={`flex flex-col gap-3 rounded-md border p-3 text-sm ${
                dangerous
                    ? 'border-error/40 bg-error/10 text-error'
                    : 'border-primary/30 bg-primary/10 text-foreground'
            }`}
            data-testid="sign-data-retry-alert"
            data-dispatched={dangerous ? 'true' : 'false'}
        >
            <div className="flex items-center gap-2 font-semibold">
                {dangerous ? (
                    <AlertTriangle className="size-4 shrink-0" />
                ) : (
                    <Info className="size-4 shrink-0" />
                )}
                {dangerous ? 'Possible duplicate signature' : 'Request not delivered'}
            </div>
            <p className="leading-relaxed">
                {dangerous ? (
                    <>
                        The payload was delivered to the wallet inside the connect URL, but no
                        signature came back. The wallet may have already signed it. Confirm before
                        retrying — otherwise you may collect a second signature for the same
                        payload.
                    </>
                ) : (
                    <>
                        The wallet connected but did not receive the request. It is safe to ask the
                        wallet to sign again over the bridge.
                    </>
                )}
            </p>
            <div className="flex flex-wrap gap-2">
                <Button size="s" onClick={onRetry} data-testid="sign-data-retry-button">
                    Retry signing
                </Button>
                <Button
                    size="s"
                    variant="ghost"
                    onClick={onDismiss}
                    data-testid="sign-data-retry-dismiss-button"
                >
                    Dismiss
                </Button>
            </div>
        </div>
    );
};
