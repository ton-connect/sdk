import { useEffect, useRef, useState } from 'react';

import { ButtonWithConnect } from '../../../../core/components/ui/button-with-connect';
import { JsonEditor } from '../../../../core/components/ui/json-editor';
import { ResultBlock } from '../../../../core/components/shared/result-block';
import { SettingsButton } from '../../../../core/components/ui/settings-button';

import { ConfigureHeader, ModeField, RetryAlert, SettingsModal } from './components';
import { useSignData, useSignDataForm } from './hooks';

export const SignData = () => {
    const form = useSignDataForm();
    const ops = useSignData();
    const [settingsOpen, setSettingsOpen] = useState(false);

    // Scroll the most-recent result into view when a new one arrives.
    const resultRef = useRef<HTMLDivElement>(null);
    useEffect(() => {
        if (!ops.result || !resultRef.current) return;
        const rect = resultRef.current.getBoundingClientRect();
        if (rect.top < 0 || rect.bottom > window.innerHeight) {
            resultRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, [ops.result]);

    const handleSign = () => {
        if (!form.payload || form.isInvalid) return;
        ops.send(form.payload, { withConnect: form.withConnect });
    };

    const disableAction = form.isInvalid || ops.sending || !!ops.retryPrompt;

    return (
        <div className="flex w-full flex-col gap-2" data-testid="sign-data">
            <ConfigureHeader onReset={form.reset} />

            <ModeField mode={form.mode} onChange={form.setMode} />

            <JsonEditor
                className="mb-4"
                value={form.draft}
                onChange={form.onDraftChange}
                invalid={form.isInvalid}
                data-testid="sign-data-json-editor"
            />

            <div className="flex items-stretch gap-2">
                <ButtonWithConnect
                    size="l"
                    fullWidth
                    onClick={handleSign}
                    loading={ops.sending}
                    disabled={disableAction}
                    skipConnectPrompt={form.withConnect}
                    data-testid="sign-data-action-button"
                >
                    Sign
                </ButtonWithConnect>
                <SettingsButton
                    onClick={() => setSettingsOpen(true)}
                    data-testid="sign-data-settings-button"
                />
            </div>

            <SettingsModal
                open={settingsOpen}
                onOpenChange={setSettingsOpen}
                withConnect={form.withConnect}
                onWithConnectChange={form.setWithConnect}
            />

            {ops.retryPrompt && (
                <RetryAlert
                    prompt={ops.retryPrompt}
                    onRetry={handleSign}
                    onDismiss={ops.dismissRetryPrompt}
                />
            )}

            {ops.result && (
                <ResultBlock
                    ref={resultRef}
                    title="Sign data"
                    result={ops.result}
                    onDismiss={ops.clearResult}
                    testIdPrefix="sign-data-result"
                />
            )}
        </div>
    );
};
