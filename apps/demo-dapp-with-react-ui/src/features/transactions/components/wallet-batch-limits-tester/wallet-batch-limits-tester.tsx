import { useTonConnectUI, useTonWallet } from '@tonconnect/ui-react';
import { Wallet } from 'lucide-react';

import { Button } from '../../../../core/components/ui/button';
import { EmptyState } from '../../../../core/components/empty-state';
import { JsonEditor } from '../../../../core/components/ui/json-editor';
import { ResultBlock } from '../../../../core/components/ui/result-block';

import { ConfigureHeader } from './components/configure-header';
import { CountField } from './components/count-field';
import { ModeField } from './components/mode-field';
import { useBatchTester } from './hooks';

export const WalletBatchLimitsTester = () => {
    const wallet = useTonWallet();
    const [tonConnectUI] = useTonConnectUI();
    const {
        mode,
        setMode,
        count,
        setCount,
        draft,
        onDraftChange,
        isInvalid,
        send,
        sending,
        result,
        clearResult,
        reset
    } = useBatchTester();

    if (!wallet) {
        return (
            <EmptyState
                icon={Wallet}
                title="Connect a wallet"
                description="A connected wallet is required to probe batch message limits."
                action={
                    <Button
                        onClick={() => tonConnectUI.openModal()}
                        data-testid="batch-limits-connect-wallet-button"
                    >
                        Connect wallet
                    </Button>
                }
            />
        );
    }

    const actionLabel = mode === 'sendTransaction' ? 'Send transaction' : 'Sign message';

    return (
        <div className="flex flex-col gap-4" data-testid="batch-limits-tester">
            <ConfigureHeader onReset={reset} />

            <ModeField mode={mode} onChange={setMode} />

            <CountField count={count} onChange={setCount} />

            <JsonEditor
                value={draft}
                onChange={onDraftChange}
                invalid={isInvalid}
                data-testid="batch-limits-request-editor"
            />

            <Button
                size="l"
                fullWidth
                loading={sending}
                disabled={sending || isInvalid || count <= 0}
                onClick={send}
                data-testid="batch-limits-action-button"
            >
                {actionLabel}
            </Button>

            {result && (
                <ResultBlock
                    title={actionLabel}
                    result={result}
                    onDismiss={clearResult}
                    testIdPrefix="batch-limits-result"
                />
            )}
        </div>
    );
};
