import type { FC, ReactNode } from 'react';
import { AlertTriangle, Info } from 'lucide-react';

import { Button } from '../button';
import { cn } from '../../../lib/utils';

export interface RetryAlertProps {
    /**
     * When true, the alert renders as a warning — the wallet may already have
     * processed the request, so a blind retry could duplicate it.
     */
    dispatched: boolean;
    title: string;
    description: ReactNode;
    retryLabel: string;
    onRetry: () => void;
    onDismiss: () => void;
    className?: string;
    /**
     * Optional prefix for `data-testid` on internal elements. The root carries
     * the prefix directly; sub-elements get `${prefix}-retry-button` and
     * `${prefix}-dismiss-button`.
     */
    testIdPrefix?: string;
}

/**
 * Surfaces an embedded-request flow where the wallet connected but no response
 * came back. Used after `signData` / `sendTransaction` / `signMessage` calls
 * with `enableEmbeddedRequest: true` that return `hasResponse: false`.
 */
export const RetryAlert: FC<RetryAlertProps> = ({
    dispatched,
    title,
    description,
    retryLabel,
    onRetry,
    onDismiss,
    className,
    testIdPrefix
}) => (
    <div
        className={cn(
            'mt-4 flex flex-col gap-3 rounded-xl bg-secondary p-4 text-sm text-foreground',
            className
        )}
        data-testid={testIdPrefix}
        data-dispatched={dispatched ? 'true' : 'false'}
    >
        <div
            className={cn(
                'flex items-center gap-2 font-semibold',
                dispatched ? 'text-error' : 'text-foreground'
            )}
        >
            {dispatched ? (
                <AlertTriangle className="size-4 shrink-0" />
            ) : (
                <Info className="size-4 shrink-0 text-primary" />
            )}
            {title}
        </div>
        <p className="leading-relaxed text-secondary-foreground">{description}</p>
        <div className="flex flex-wrap gap-2">
            <Button
                size="s"
                onClick={onRetry}
                data-testid={testIdPrefix ? `${testIdPrefix}-retry-button` : undefined}
            >
                {retryLabel}
            </Button>
            <Button
                size="s"
                variant="ghost"
                onClick={onDismiss}
                data-testid={testIdPrefix ? `${testIdPrefix}-dismiss-button` : undefined}
            >
                Dismiss
            </Button>
        </div>
    </div>
);
