import { useEffect, useRef, useState } from 'react';
import { useTonWallet } from '@tonconnect/ui-react';

import { ButtonWithConnect } from '../../../../core/components/ui/button-with-connect';
import { ResultBlock } from '../../../../core/components/shared/result-block';
import { JsonEditor } from '../../../../core/components/ui/json-editor';
import { SettingsButton } from '../../../../core/components/ui/settings-button';

import {
    buildDefaultTx,
    buildItemsTx,
    buildNftItemsTx,
    type PresetKey
} from './utils/transaction-presets';

import {
    ConfigureHeader,
    ModeField,
    RetryAlert,
    SettingsModal,
    ValidUntilField,
    WaitingStatus
} from './components';
import {
    type RequestMode,
    useSendTransaction,
    useTransactionForm,
    useValidUntilTimer
} from './hooks';

export const SendTransaction = () => {
    const wallet = useTonWallet();

    const form = useTransactionForm();
    const ops = useSendTransaction();
    const timer = useValidUntilTimer(form.validUntil);
    const [settingsOpen, setSettingsOpen] = useState(false);

    // Scroll the most-recent result into view when it changes. Each completed
    // op stores a fresh OperationResult object, so identity is enough to detect
    // "new result arrived".
    const resultRef = useRef<HTMLDivElement>(null);
    const activeResult = form.mode === 'send' ? ops.txResult : ops.signResult;
    useEffect(() => {
        if (!activeResult || !resultRef.current) return;
        const rect = resultRef.current.getBoundingClientRect();
        if (rect.top < 0 || rect.bottom > window.innerHeight) {
            resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [activeResult]);

    const loadPreset = (key: PresetKey) => {
        if (key === 'default-tx') form.replaceTx(buildDefaultTx());
        else if (key === 'items-tx') form.replaceTx(buildItemsTx());
        else if (key === 'nft-items-tx') form.replaceTx(buildNftItemsTx(wallet?.account?.address));
    };

    const handleModeChange = (next: RequestMode) => {
        if (next === form.mode) return;
        form.setMode(next);
        // The retry prompt is bound to a specific action — discard it on switch
        // so the user doesn't see, e.g. a "Retry signing" alert in Send mode.
        ops.dismissRetryPrompt();
        // Drop both stored results — switching mode is a fresh-start gesture, and
        // a stale result from the previous mode is just noise.
        ops.clearResults();
    };

    const handleAction = () =>
        form.mode === 'send'
            ? ops.sendTransaction(form.tx, {
                  withConnect: form.withConnect,
                  waitForTx: form.waitForTx
              })
            : ops.signMessage(form.tx, { withConnect: form.withConnect, waitForTx: false });

    const disableAction =
        form.isInvalid || ops.sendingTx || ops.waitingTx || ops.signing || !!ops.retryPrompt;
    const actionLoading = form.mode === 'send' ? ops.sendingTx || ops.waitingTx : ops.signing;
    const actionLabel = form.mode === 'send' ? 'Send transaction' : 'Sign message';
    const resultTitle = form.mode === 'send' ? 'Transaction' : 'Sign message result';
    const dismissActiveResult = form.mode === 'send' ? ops.clearTxResult : ops.clearSignResult;

    return (
        <div className="flex w-full flex-col gap-2" data-testid="tx-request">
            <ConfigureHeader onReset={form.reset} onPresetSelect={loadPreset} />

            <ModeField mode={form.mode} onChange={handleModeChange} />

            <ValidUntilField
                validUntil={form.validUntil}
                onChange={form.setValidUntil}
                onSetFromNow={form.setValidUntilFromNow}
                timer={timer}
            />

            <JsonEditor
                className="mb-4"
                value={form.draft}
                onChange={form.onDraftChange}
                invalid={form.isInvalid}
                data-testid="tx-request-json-editor"
            />

            <div className="flex items-stretch gap-2">
                <ButtonWithConnect
                    size="l"
                    fullWidth
                    onClick={handleAction}
                    loading={actionLoading}
                    disabled={disableAction}
                    skipConnectPrompt={form.withConnect}
                    data-testid="tx-request-action-button"
                >
                    {actionLabel}
                </ButtonWithConnect>
                <SettingsButton
                    onClick={() => setSettingsOpen(true)}
                    data-testid="tx-request-settings-button"
                />
            </div>

            {form.mode === 'send' && form.waitForTx && <WaitingStatus waiting={ops.waitingTx} />}

            <SettingsModal
                open={settingsOpen}
                onOpenChange={setSettingsOpen}
                withConnect={form.withConnect}
                onWithConnectChange={form.setWithConnect}
                waitForTx={form.waitForTx}
                onWaitForTxChange={form.setWaitForTx}
            />

            {ops.retryPrompt && (
                <RetryAlert
                    prompt={ops.retryPrompt}
                    onRetry={handleAction}
                    onDismiss={ops.dismissRetryPrompt}
                />
            )}

            {activeResult && (
                <ResultBlock
                    ref={resultRef}
                    title={resultTitle}
                    result={activeResult}
                    onDismiss={dismissActiveResult}
                    testIdPrefix="tx-request-result"
                />
            )}
        </div>
    );
};
