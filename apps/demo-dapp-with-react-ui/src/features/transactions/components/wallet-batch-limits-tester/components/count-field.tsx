import type { FC } from 'react';

import { Button } from '../../../../../core/components/ui/button';
import { Input } from '../../../../../core/components/ui/input';

interface CountFieldProps {
    count: number;
    onChange: (next: number) => void;
}

const PRESETS = [1, 4, 5, 255, 256];

export const CountField: FC<CountFieldProps> = ({ count, onChange }) => (
    <Input size="s" data-testid="batch-limits-count-field">
        <Input.Header>
            <Input.Title data-testid="batch-limits-count-title">Message count</Input.Title>
        </Input.Header>
        <Input.Field>
            <Input.Input
                type="number"
                min={1}
                value={count}
                onChange={e => onChange(Math.max(1, parseInt(e.target.value) || 0))}
                data-testid="batch-limits-count-input"
            />
        </Input.Field>

        <div className="mb-3 flex flex-wrap gap-2 pt-1">
            {PRESETS.map(preset => (
                <Button
                    key={preset}
                    variant="bezeled"
                    size="xs"
                    onClick={() => onChange(preset)}
                    data-testid={`batch-limits-count-preset-${preset}`}
                >
                    {preset}
                </Button>
            ))}
        </div>
    </Input>
);
