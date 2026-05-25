import { useMemo } from 'react';
import type { FC } from 'react';

import { CopyButton } from '../../ui/copy-button';
import { JsonView } from '../../ui/json-view';
import { cn } from '../../../utils/cn';

const stringifyForCopy = (src: unknown): string => {
    if (typeof src === 'string') return src;
    try {
        return JSON.stringify(src, null, 2);
    } catch {
        return String(src);
    }
};

interface ResultPanelProps {
    title: string;
    /** Value to display via {@link JsonView} and write to the clipboard. */
    src: unknown;
    className?: string;
    /**
     * Optional prefix for `data-testid` on internal elements. When set, the
     * copy button gets `${prefix}-copy-button` and JsonView gets `${prefix}-json`.
     */
    testIdPrefix?: string;
}

export const ResultPanel: FC<ResultPanelProps> = ({ title, src, className, testIdPrefix }) => {
    const copyValue = useMemo(() => stringifyForCopy(src), [src]);

    return (
        <div className={cn('flex w-full flex-col gap-2', className)}>
            <div className="flex items-center justify-between gap-2">
                <span className="text-[15px] font-medium tracking-[0.01em] text-secondary-foreground">
                    {title}
                </span>
                <CopyButton
                    value={copyValue}
                    aria-label="Copy"
                    data-testid={testIdPrefix ? `${testIdPrefix}-copy-button` : undefined}
                />
            </div>
            <div className="w-full">
                <JsonView
                    src={src}
                    data-testid={testIdPrefix ? `${testIdPrefix}-json` : undefined}
                />
            </div>
        </div>
    );
};
