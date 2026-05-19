import { forwardRef } from 'react';

import { Button } from '@/core/components/ui/button';
import { JsonView } from '@/core/components/ui/json-view';
import { ResultPanel } from '@/core/components/result-panel';

import type { OperationResult } from '../hooks';

interface ResultBlockProps {
    title: string;
    result: OperationResult;
    onDismiss: () => void;
}

export const ResultBlock = forwardRef<HTMLDivElement, ResultBlockProps>(
    ({ title, result, onDismiss }, ref) => {
        return (
            <div
                ref={ref}
                className="flex flex-col gap-3 mt-4"
                data-testid="tx-request-result"
                data-status={result.status}
            >
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <h3 className="text-lg font-semibold text-foreground">{title}</h3>
                        <span
                            className={`rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide ${
                                result.status === 'success'
                                    ? 'bg-success/15 text-success'
                                    : 'bg-error/15 text-error'
                            }`}
                            data-testid="tx-request-result-status"
                        >
                            {result.status}
                        </span>
                    </div>
                    <Button
                        variant="secondary"
                        size="s"
                        onClick={onDismiss}
                        data-testid="tx-request-result-dismiss-button"
                    >
                        Dismiss
                    </Button>
                </div>
                <ResultPanel title="Response">
                    <JsonView src={result.response} data-testid="tx-request-result-json" />
                </ResultPanel>
            </div>
        );
    }
);

ResultBlock.displayName = 'ResultBlock';
