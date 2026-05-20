import type { FC } from 'react';

import { Button } from '../../../../../core/components/ui/button';

import { JETTON_TICKER } from '../lib/constants';
import { JettonIcon } from './jetton-icon';

interface SupplyBlockProps {
    supply: string;
    testIdPrefix: string;
}

export const SupplyBlock: FC<SupplyBlockProps> = ({ supply, testIdPrefix }) => (
    <div className="flex items-center gap-2" data-testid={testIdPrefix}>
        <span data-testid={`${testIdPrefix}-icon`}>
            <JettonIcon size={36} />
        </span>
        <div className="flex flex-1 flex-col">
            <span
                className="text-sm text-secondary-foreground"
                data-testid={`${testIdPrefix}-label`}
            >
                Initial mint
            </span>
            <span className="text-base font-medium leading-5 text-foreground">
                <span data-testid={`${testIdPrefix}-value`}>
                    {supply} {JETTON_TICKER}
                </span>
            </span>
        </div>
        <Button
            size="s"
            variant="bezeled"
            disabled
            data-testid={`${testIdPrefix}-preset-button`}
        >
            Preset
        </Button>
    </div>
);
