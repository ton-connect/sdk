import type { ComponentProps, FC } from 'react';

import { CenteredAmountInput } from '../../../../../core/components/ui/centered-amount-input';
import { Input } from '../../../../../core/components/ui/input';
import { cn } from '../../../../../core/utils/cn';

import { USDT_TICKER } from '../utils/constants';

interface AmountSectionProps extends Omit<ComponentProps<'div'>, 'onChange'> {
    value: string;
    onChange: (value: string) => void;
    errorMessage?: string | null;
}

export const AmountSection: FC<AmountSectionProps> = ({
    value,
    onChange,
    errorMessage,
    className,
    ...props
}) => (
    <Input
        size="s"
        error={Boolean(errorMessage)}
        className={cn(className)}
        data-testid="transfer-usdt-amount-field"
        {...props}
    >
        <Input.Header>
            <Input.Title data-testid="transfer-usdt-amount-title">You send</Input.Title>
        </Input.Header>

        <div
            className={cn(
                'rounded-xl border-2 border-transparent px-1 py-2 transition-colors',
                errorMessage && 'border-error'
            )}
        >
            <CenteredAmountInput
                value={value}
                onValueChange={onChange}
                ticker={USDT_TICKER}
                align="start"
                data-testid="transfer-usdt-amount-input"
            />
        </div>

        {errorMessage ? (
            <Input.Caption data-testid="transfer-usdt-amount-error">{errorMessage}</Input.Caption>
        ) : null}
    </Input>
);
