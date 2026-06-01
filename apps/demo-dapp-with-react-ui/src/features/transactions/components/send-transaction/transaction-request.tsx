import { useCallback, useEffect, useRef, useState } from 'react';
import type { SendTransactionRequest } from '@tonconnect/ui-react';
import { useTonWallet } from '@tonconnect/ui-react';

import { ButtonWithConnect } from '../../../../core/components/ui/button-with-connect';
import { ResultBlock } from '../../../../core/components/shared/result-block';
import { RequestContextQuickFill } from '../../../../core/components/shared/request-context-quick-fill';
import { JsonEditor } from '../../../../core/components/ui/json-editor';
import { SettingsButton } from '../../../../core/components/ui/settings-button';
import {
    mergeRequestContext,
    type RequestContextPatch
} from '../../../../core/utils/merge-request-context';

import {
    buildDefaultSignMessage,
    buildSignMessagePreset,
    SIGN_MESSAGE_PRESETS,
    type SignMessagePresetKey
} from '../sign-message/utils/sign-message-presets';
import {
    buildDefaultTx,
    buildItemsTx,
    buildNftItemsTx,
    PRESETS as SEND_TRANSACTION_PRESETS,
    type PresetKey
} from './utils/transaction-presets';

import {
    ConfigureHeader,
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

interface TransactionRequestProps {
    mode: RequestMode;
    testIdPrefix: string;
}

export const TransactionRequest = ({ mode, testIdPrefix }: TransactionRequestProps) => {
    const wallet = useTonWallet();
    const isSend = mode === 'send';

    const form = useTransactionForm(isSend ? buildDefaultTx : buildDefaultSignMessage);
    const ops = useSendTransaction();
    const timer = useValidUntilTimer(form.validUntil);
    const [settingsOpen, setSettingsOpen] = useState(false);

    const resultRef = useRef<HTMLDivElement>(null);
    const activeResult = isSend ? ops.txResult : ops.signResult;
    useEffect(() => {
        if (!activeResult || !resultRef.current) return;
        const rect = resultRef.current.getBoundingClientRect();
        if (rect.top < 0 || rect.bottom > window.innerHeight) {
            resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [activeResult]);

    const loadPreset = (key: string) => {
        if (isSend) {
            const sendKey = key as PresetKey;
            if (sendKey === 'default-tx') form.replaceTx(buildDefaultTx());
            else if (sendKey === 'items-tx') form.replaceTx(buildItemsTx());
            else if (sendKey === 'nft-items-tx') {
                form.replaceTx(buildNftItemsTx(wallet?.account?.address));
            }
            return;
        }

        form.replaceTx(buildSignMessagePreset(key as SignMessagePresetKey));
    };

    const handleAction = () =>
        isSend
            ? ops.sendTransaction(form.tx, {
                  withConnect: form.withConnect,
                  waitForTx: form.waitForTx
              })
            : ops.signMessage(form.tx, { withConnect: form.withConnect, waitForTx: false });

    const disableAction =
        form.isInvalid || ops.sendingTx || ops.waitingTx || ops.signing || !!ops.retryPrompt;
    const actionLoading = isSend ? ops.sendingTx || ops.waitingTx : ops.signing;
    const actionLabel = isSend ? 'Send transaction' : 'Sign message';
    const resultTitle = isSend ? 'Transaction' : 'Sign message result';
    const dismissActiveResult = isSend ? ops.clearTxResult : ops.clearSignResult;

    const retryPrompt =
        ops.retryPrompt &&
        (isSend ? ops.retryPrompt.kind === 'sendTx' : ops.retryPrompt.kind === 'signMessage')
            ? ops.retryPrompt
            : null;

    const applyRequestContext = useCallback(
        (patch: RequestContextPatch) => {
            try {
                const parsed = JSON.parse(form.draft);
                if (!parsed || typeof parsed !== 'object') return;
                form.replaceTx(mergeRequestContext(parsed as SendTransactionRequest, patch));
            } catch {
                // Ignore while JSON is invalid — editor shows invalid state.
            }
        },
        [form]
    );

    return (
        <div className="flex w-full flex-col gap-2" data-testid={testIdPrefix}>
            <ConfigureHeader
                onReset={form.reset}
                onPresetSelect={loadPreset}
                presets={isSend ? SEND_TRANSACTION_PRESETS : SIGN_MESSAGE_PRESETS}
                presetsDescription={
                    isSend
                        ? 'Replace the current request with a ready-made sendTransaction example.'
                        : 'Replace the current request with a ready-made signMessage example.'
                }
                testIdPrefix={testIdPrefix}
            />

            <ValidUntilField
                validUntil={form.validUntil}
                onChange={form.setValidUntil}
                onSetFromNow={form.setValidUntilFromNow}
                timer={timer}
                errorMessage={form.validUntilError}
                warningMessage={form.validUntilWarning}
                testIdPrefix={testIdPrefix}
            />

            <RequestContextQuickFill onPatch={applyRequestContext} testIdPrefix={testIdPrefix} />

            <JsonEditor
                className="mb-4"
                value={form.draft}
                onChange={form.onDraftChange}
                invalid={form.isInvalid}
                messages={form.editorMessages}
                warnings={form.editorWarnings}
                data-testid={`${testIdPrefix}-json-editor`}
            />

            <div className="flex items-stretch gap-2">
                <ButtonWithConnect
                    size="l"
                    fullWidth
                    onClick={handleAction}
                    loading={actionLoading}
                    disabled={disableAction}
                    skipConnectPrompt={form.withConnect}
                    data-testid={`${testIdPrefix}-action-button`}
                >
                    {actionLabel}
                </ButtonWithConnect>
                <SettingsButton
                    onClick={() => setSettingsOpen(true)}
                    data-testid={`${testIdPrefix}-settings-button`}
                />
            </div>

            {isSend && form.waitForTx && (
                <WaitingStatus waiting={ops.waitingTx} testIdPrefix={testIdPrefix} />
            )}

            <SettingsModal
                open={settingsOpen}
                onOpenChange={setSettingsOpen}
                withConnect={form.withConnect}
                onWithConnectChange={form.setWithConnect}
                waitForTx={form.waitForTx}
                onWaitForTxChange={form.setWaitForTx}
                showWaitForTx={isSend}
                testIdPrefix={testIdPrefix}
            />

            {retryPrompt && (
                <RetryAlert
                    prompt={retryPrompt}
                    onRetry={handleAction}
                    onDismiss={ops.dismissRetryPrompt}
                    testIdPrefix={testIdPrefix}
                />
            )}

            {activeResult && (
                <ResultBlock
                    ref={resultRef}
                    title={resultTitle}
                    result={activeResult}
                    onDismiss={dismissActiveResult}
                    testIdPrefix={`${testIdPrefix}-result`}
                />
            )}
        </div>
    );
};
