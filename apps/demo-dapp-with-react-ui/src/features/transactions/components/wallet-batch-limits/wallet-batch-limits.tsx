import { ButtonWithConnect } from '../../../../core/components/ui/button-with-connect';
import { JsonEditor } from '../../../../core/components/ui/json-editor';
import { ResultBlock } from '../../../../core/components/shared/result-block';
import { RequestContextQuickFill } from '../../../../core/components/shared/request-context-quick-fill';

import { ValidUntilField } from '../send-transaction/components/valid-until-field';
import { useValidUntilTimer } from '../send-transaction/hooks';

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
        showInvalidUi,
        editorMessages,
        editorWarnings,
        send,
        sending,
        result,
        clearResult,
        reset,
        validUntil,
        setValidUntil,
        setValidUntilFromNow,
        validUntilError,
        validUntilWarning,
        countError,
        countWarning,
        isCountBlocked
    } = useBatchTester();

    const timer = useValidUntilTimer(validUntil);
    const actionLabel = mode === 'sendTransaction' ? 'Send transaction' : 'Sign message';

    return (
        <div className="flex flex-col gap-4" data-testid="batch-limits-tester">
            <ConfigureHeader onReset={reset} />

            <ModeField mode={mode} onChange={setMode} />

            <CountField
                count={count}
                onChange={setCount}
                errorMessage={countError}
                warningMessage={countWarning}
            />

            <ValidUntilField
                validUntil={validUntil}
                onChange={setValidUntil}
                onSetFromNow={setValidUntilFromNow}
                timer={timer}
                errorMessage={validUntilError}
                warningMessage={validUntilWarning}
                testIdPrefix="batch-limits"
            />

            <RequestContextQuickFill onPatch={applyRequestContext} testIdPrefix="batch-limits" />

            <JsonEditor
                value={draft}
                onChange={onDraftChange}
                invalid={showInvalidUi}
                messages={editorMessages}
                warnings={editorWarnings}
                data-testid="batch-limits-request-editor"
            />

            <ButtonWithConnect
                size="l"
                fullWidth
                loading={sending}
                disabled={sending || isInvalid || isCountBlocked}
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
