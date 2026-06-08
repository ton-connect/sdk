import type { FC } from 'react';

import { Button } from '../../ui/button';
import { useRequestContextSources } from '../../../hooks/use-request-context-sources';
import type { RequestContextPatch } from '../../../utils/merge-request-context';

export interface RequestContextQuickFillProps {
    onPatch: (patch: RequestContextPatch) => void;
    testIdPrefix: string;
    className?: string;
}

/**
 * One-click helpers for `from` and `network` on sendTransaction / signMessage /
 * signData JSON requests — saves QA from typing addresses and chain ids by hand.
 */
export const RequestContextQuickFill: FC<RequestContextQuickFillProps> = ({
    onPatch,
    testIdPrefix,
    className
}) => {
    const { fromAddress, networks } = useRequestContextSources();

    return (
        <div
            className={className ?? 'flex flex-col gap-2'}
            data-testid={`${testIdPrefix}-context-quick-fill`}
        >
            <span className="text-xs font-medium text-secondary-foreground">Quick fill</span>
            <div className="flex flex-wrap gap-2">
                <Button
                    type="button"
                    variant="bezeled"
                    size="xs"
                    disabled={!fromAddress}
                    onClick={() => fromAddress && onPatch({ from: fromAddress })}
                    data-testid={`${testIdPrefix}-context-from-wallet`}
                >
                    From: wallet
                </Button>
                {networks.map(option => (
                    <Button
                        key={option.id}
                        type="button"
                        variant="bezeled"
                        size="xs"
                        onClick={() => onPatch({ network: option.value })}
                        data-testid={`${testIdPrefix}-context-network-${option.id}`}
                    >
                        Network: {option.label}
                    </Button>
                ))}
            </div>
        </div>
    );
};
