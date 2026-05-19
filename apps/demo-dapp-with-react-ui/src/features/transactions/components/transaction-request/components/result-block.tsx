import { forwardRef } from 'react';
import ReactJson from 'react-json-view';

import { Button } from '@/core/components/ui/button';
import { ResultPanel } from '@/core/components/result-panel';

import type { OperationResult } from '../../../hooks/use-transaction';

interface ResultBlockProps {
    result: OperationResult;
    onLoadToForm: () => void;
    onDismiss: () => void;
}

export const ResultBlock = forwardRef<HTMLDivElement, ResultBlockProps>(
    ({ result, onLoadToForm, onDismiss }, ref) => {
        return (
            <div ref={ref} className="flex flex-col gap-3">
                <div className="flex items-center justify-between">
                    <span
                        className={`text-sm font-semibold ${
                            result.status === 'success' ? 'text-success' : 'text-error'
                        }`}
                    >
                        {result.status === 'success' ? 'Success' : 'Error'}
                    </span>
                    <div className="flex gap-2">
                        <Button variant="ghost" size="s" onClick={onLoadToForm}>
                            Load to form
                        </Button>
                        <Button variant="ghost" size="s" onClick={onDismiss}>
                            Dismiss
                        </Button>
                    </div>
                </div>
                <ResultPanel title="Response">
                    <ReactJson
                        src={JSON.parse(result.response)}
                        name={false}
                        theme="ocean"
                        collapsed={false}
                    />
                </ResultPanel>
            </div>
        );
    }
);

ResultBlock.displayName = 'ResultBlock';
