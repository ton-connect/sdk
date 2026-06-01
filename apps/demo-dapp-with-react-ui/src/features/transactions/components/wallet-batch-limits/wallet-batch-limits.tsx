import { ButtonWithConnect } from '../../../../core/components/ui/button-with-connect';
import { JsonEditor } from '../../../../core/components/ui/json-editor';
import { ResultBlock } from '../../../../core/components/shared/result-block';
import { RequestContextQuickFill } from '../../../../core/components/shared/request-context-quick-fill';

import { ConfigureHeader } from './components/configure-header';
import { CountField } from './components/count-field';
import { ModeField } from './components/mode-field';
import { useBatchTester } from './hooks';

export const WalletBatchLimits = () => {
    const {
        mode,
        setMode,
        count,
        setCount,
        draft,
        onDraftChange,
        applyRequestContext,
        isInvalid,
        editorMessages,
        editorWarnings,
        send,
        sending,
        result,
        clearResult,
        reset
    } = useBatchTester();

    const actionLabel = mode === 'sendTransaction' ? 'Send transaction' : 'Sign message';

    return (
        <div className="flex flex-col gap-4" data-testid="batch-limits-tester">
            <ConfigureHeader onReset={reset} />

            <ModeField mode={mode} onChange={setMode} />

            <CountField count={count} onChange={setCount} />

            <RequestContextQuickFill onPatch={applyRequestContext} testIdPrefix="batch-limits" />

            <JsonEditor
                value={draft}
                onChange={onDraftChange}
                invalid={isInvalid}
                messages={editorMessages}
                warnings={editorWarnings}
                data-testid="batch-limits-request-editor"
            />

            <ButtonWithConnect
                size="l"
                fullWidth
                loading={sending}
                disabled={sending || isInvalid || count <= 0}
                onClick={send}
                data-testid="batch-limits-action-button"
            >
                {actionLabel}
            </ButtonWithConnect>

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
