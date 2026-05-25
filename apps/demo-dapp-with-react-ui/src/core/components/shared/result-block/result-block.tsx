import { forwardRef } from 'react';

import { Button } from '../../ui/button';
import { ResultPanel } from '../result-panel';
import { cn } from '../../../utils/cn';

/**
 * Outcome of an async wallet operation (send transaction, sign message, jetton
 * transfer, …) shaped for {@link ResultBlock}. `response` is pre-stringified
 * JSON so the component stays display-only.
 */
export interface OperationResult {
    status: 'success' | 'error';
    response: string;
}

export const ok = (response: unknown): OperationResult => ({
    status: 'success',
    response: JSON.stringify(response, null, 2)
});

export const fail = (error: unknown): OperationResult => ({
    status: 'error',
    response: JSON.stringify(
        { error: error instanceof Error ? error.message : 'Operation failed' },
        null,
        2
    )
});

interface ResultBlockProps {
    title: string;
    result: OperationResult;
    onDismiss: () => void;
    /**
     * Stable prefix for `data-testid` attributes. The root carries the prefix
     * directly; sub-elements get `${prefix}-status`, `${prefix}-dismiss-button`,
     * `${prefix}-copy-button`, `${prefix}-json`.
     */
    testIdPrefix: string;
}

export const ResultBlock = forwardRef<HTMLDivElement, ResultBlockProps>(
    ({ title, result, onDismiss, testIdPrefix }, ref) => (
        <div
            ref={ref}
            className="mt-4 flex flex-col gap-3"
            data-testid={testIdPrefix}
            data-status={result.status}
        >
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <h3 className="text-lg font-semibold text-foreground">{title}</h3>
                    <span
                        className={cn(
                            'rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide',
                            result.status === 'success'
                                ? 'bg-success/15 text-success'
                                : 'bg-error/15 text-error'
                        )}
                        data-testid={`${testIdPrefix}-status`}
                    >
                        {result.status}
                    </span>
                </div>
                <Button
                    variant="secondary"
                    size="s"
                    onClick={onDismiss}
                    data-testid={`${testIdPrefix}-dismiss-button`}
                >
                    Dismiss
                </Button>
            </div>
            <ResultPanel title="Response" src={result.response} testIdPrefix={testIdPrefix} />
        </div>
    )
);

ResultBlock.displayName = 'ResultBlock';
