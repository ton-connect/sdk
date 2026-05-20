import type { FC } from 'react';

import { Button } from '../../../../../core/components/ui/button';
import { Skeleton } from '../../../../../core/components/ui/skeleton';

import { USDT_TICKER } from '../lib/constants';
import { UsdtIcon } from './usdt-icon';

interface BalanceBlockProps {
    balance: string | null;
    loading: boolean;
    onMaxClick: () => void;
    maxDisabled: boolean;
    /**
     * Stable prefix for `data-testid` attributes. The root carries the prefix
     * directly; sub-elements get `${prefix}-icon`, `${prefix}-label`, etc.
     */
    testIdPrefix: string;
}

export const BalanceBlock: FC<BalanceBlockProps> = ({
    balance,
    loading,
    onMaxClick,
    maxDisabled,
    testIdPrefix
}) => (
    <div className="flex items-center gap-2" data-testid={testIdPrefix}>
        <span data-testid={`${testIdPrefix}-icon`}>
            <UsdtIcon size={36} />
        </span>
        <div className="flex flex-1 flex-col">
            <span
                className="text-sm text-secondary-foreground"
                data-testid={`${testIdPrefix}-label`}
            >
                Your Balance
            </span>
            <span className="text-base font-medium leading-5 text-foreground">
                {loading ? (
                    <Skeleton
                        className="inline-block h-[16px] w-[80px]"
                        data-testid={`${testIdPrefix}-skeleton`}
                    />
                ) : (
                    <span data-testid={`${testIdPrefix}-value`}>
                        {balance ?? '0'} {USDT_TICKER}
                    </span>
                )}
            </span>
        </div>
        <Button
            size="s"
            variant="bezeled"
            onClick={onMaxClick}
            disabled={maxDisabled}
            data-testid={`${testIdPrefix}-max-button`}
        >
            Max
        </Button>
    </div>
);
