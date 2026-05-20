import { RetryAlert as CoreRetryAlert } from '../../../../../core/components/ui/retry-alert';

import type { RetryPrompt } from '../hooks';

interface RetryAlertProps {
    prompt: RetryPrompt;
    onRetry: () => void;
    onDismiss: () => void;
}

export const RetryAlert = ({ prompt, onRetry, onDismiss }: RetryAlertProps) => {
    const dangerous = prompt.dispatched;
    const subject = prompt.kind === 'sendTx' ? 'transaction' : 'message';
    const retryLabel = prompt.kind === 'sendTx' ? 'Retry transaction' : 'Retry message signing';

    return (
        <CoreRetryAlert
            dispatched={dangerous}
            title={dangerous ? 'Possible duplicate' : 'Request not delivered'}
            description={
                dangerous ? (
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
                )
            }
            retryLabel={retryLabel}
            onRetry={onRetry}
            onDismiss={onDismiss}
            testIdPrefix="tx-request-retry-alert"
        />
    );
};
