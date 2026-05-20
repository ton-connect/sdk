import { RetryAlert as CoreRetryAlert } from '../../../../../core/components/ui/retry-alert';

import type { RetryPrompt } from '../hooks';

interface RetryAlertProps {
    prompt: RetryPrompt;
    onRetry: () => void;
    onDismiss: () => void;
}

export const RetryAlert = ({ prompt, onRetry, onDismiss }: RetryAlertProps) => {
    const dangerous = prompt.dispatched;

    return (
        <CoreRetryAlert
            dispatched={dangerous}
            title={dangerous ? 'Possible duplicate signature' : 'Request not delivered'}
            description={
                dangerous ? (
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
                )
            }
            retryLabel="Retry signing"
            onRetry={onRetry}
            onDismiss={onDismiss}
            testIdPrefix="sign-data-retry-alert"
        />
    );
};
