interface WaitingStatusProps {
    waiting: boolean;
}

/**
 * Shown below the action row while `waitForTx` is on. Communicates that the dApp
 * is going to poll on-chain after the wallet returns, and reflects the
 * in-flight state once the poll is happening.
 */
export const WaitingStatus = ({ waiting }: WaitingStatusProps) => (
    <div
        className="text-xs text-center text-secondary-foreground"
        data-testid="tx-request-waiting-status"
    >
        {waiting
            ? 'Waiting for transaction confirmation…'
            : 'Wait for transaction confirmation is on — the transaction will be found on-chain and shown below.'}
    </div>
);
