import { Button } from '../../../../../core/components/ui/button';
import { Input } from '../../../../../core/components/ui/input';

import type { TimerState, TimerStatus } from '../hooks';

interface ValidUntilFieldProps {
    validUntil: number | undefined;
    onChange: (next: number) => void;
    onSetFromNow: (seconds: number) => void;
    timer: TimerState;
    /** Shown under the input when `validUntil` fails semantic validation. */
    errorMessage?: string;
    testIdPrefix: string;
}

const STATUS_DOT: Record<TimerStatus, string> = {
    ok: 'bg-success',
    warning: 'bg-[#f5a73b]',
    expired: 'bg-error',
    missing: 'bg-tertiary-foreground'
};

export const ValidUntilField = ({
    validUntil,
    onChange,
    onSetFromNow,
    timer,
    errorMessage,
    testIdPrefix
}: ValidUntilFieldProps) => (
    <Input
        size="s"
        error={Boolean(errorMessage) || timer.status === 'expired' || timer.status === 'missing'}
    >
        <Input.Header>
            <Input.Title>Valid Until</Input.Title>
            <span
                className={`inline-flex items-center gap-1.5 font-mono text-xs ${
                    timer.status === 'expired' || timer.status === 'missing'
                        ? 'text-error'
                        : 'text-secondary-foreground'
                }`}
                data-testid={`${testIdPrefix}-valid-until-timer`}
                data-status={timer.status}
            >
                <span
                    className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${STATUS_DOT[timer.status]}`}
                />
                {timer.display}
            </span>
        </Input.Header>

        <Input.Field>
            <Input.Input
                type="number"
                value={validUntil ?? ''}
                placeholder="Not set"
                onChange={e => {
                    const next = e.target.valueAsNumber;
                    if (Number.isFinite(next)) {
                        onChange(next);
                    }
                }}
                data-testid={`${testIdPrefix}-valid-until-input`}
            />
        </Input.Field>

        <div className="flex flex-wrap gap-2 pt-1 mb-3">
            <Button
                variant="bezeled"
                size="xs"
                onClick={() => onSetFromNow(-600)}
                data-testid={`${testIdPrefix}-valid-until-preset-minus-10m`}
            >
                −10m
            </Button>
            <Button
                variant="bezeled"
                size="xs"
                onClick={() => onSetFromNow(-300)}
                data-testid={`${testIdPrefix}-valid-until-preset-minus-5m`}
            >
                −5m
            </Button>
            <Button
                variant="bezeled"
                size="xs"
                onClick={() => onSetFromNow(60)}
                data-testid={`${testIdPrefix}-valid-until-preset-plus-1m`}
            >
                1m
            </Button>
            <Button
                variant="bezeled"
                size="xs"
                onClick={() => onSetFromNow(300)}
                data-testid={`${testIdPrefix}-valid-until-preset-plus-5m`}
            >
                5m
            </Button>
            <Button
                variant="bezeled"
                size="xs"
                onClick={() => onSetFromNow(43_200)}
                data-testid={`${testIdPrefix}-valid-until-preset-plus-12h`}
            >
                12h
            </Button>
        </div>

        {errorMessage ? (
            <p className="text-sm text-error" data-testid={`${testIdPrefix}-valid-until-error`}>
                {errorMessage}
            </p>
        ) : null}
    </Input>
);
