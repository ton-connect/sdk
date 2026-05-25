import type { ComponentProps, FC } from 'react';

import { CenteredAmountInput } from '../../../../../core/components/ui/centered-amount-input';
import { Input } from '../../../../../core/components/ui/input';
import { cn } from '../../../../../core/utils/cn';

import { USDT_TICKER } from '../utils/constants';

interface AmountSectionProps extends Omit<ComponentProps<'div'>, 'onChange'> {
    value: string;
    onChange: (value: string) => void;
}

export const AmountSection: FC<AmountSectionProps> = ({ value, onChange, className, ...props }) => (
    <div className={cn(className)} data-testid="transfer-usdt-amount-section" {...props}>
        <Input.Title>You send</Input.Title>
        <CenteredAmountInput
            value={value}
            onValueChange={onChange}
            ticker={USDT_TICKER}
            align="start"
            data-testid="transfer-usdt-amount-input"
        />
    </div>
);
