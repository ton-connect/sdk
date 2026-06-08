import type { ComponentProps, FC } from 'react';

import { Input } from '../../../../../core/components/ui/input';

interface DestinationInputProps extends Omit<ComponentProps<'div'>, 'onChange'> {
    value: string;
    onChange: (value: string) => void;
}

export const DestinationInput: FC<DestinationInputProps> = ({ value, onChange, ...props }) => (
    <Input size="s" data-testid="transfer-usdt-destination-field" {...props}>
        <Input.Header>
            <Input.Title data-testid="transfer-usdt-destination-title">Destination</Input.Title>
        </Input.Header>
        <Input.Field>
            <Input.Input
                value={value}
                onChange={e => onChange(e.target.value)}
                placeholder="EQAB…"
                data-testid="transfer-usdt-destination-input"
            />
        </Input.Field>
    </Input>
);
