import type { FC } from 'react';

import { Button } from '../../../../../core/components/ui/button';
import { Input } from '../../../../../core/components/ui/input';
import { useIntegerInputDraft } from '../../../../../core/hooks/use-integer-input-draft';

interface CountFieldProps {
    count: number;
    onChange: (next: number) => void;
}

const PRESETS = [1, 4, 5, 255, 256];

export const CountField: FC<CountFieldProps> = ({ count, onChange }) => {
    const input = useIntegerInputDraft(
        count,
        next => {
            if (next !== undefined) {
                onChange(next);
            }
        },
        {
            shouldCommit: value => value >= 1
        }
    );

    return (
        <Input size="s" data-testid="batch-limits-count-field">
            <Input.Header>
                <Input.Title data-testid="batch-limits-count-title">Message count</Input.Title>
            </Input.Header>
            <Input.Field>
                <Input.Input
                    type="text"
                    inputMode="numeric"
                    pattern="[0-9]*"
                    value={input.value}
                    onChange={input.onChange}
                    onBlur={input.onBlur}
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
};
