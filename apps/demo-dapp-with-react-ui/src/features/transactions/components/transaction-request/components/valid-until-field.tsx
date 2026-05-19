import { Button } from '@/core/components/ui/button';
import { Input } from '@/core/components/ui/input';

import type { TimerState, TimerStatus } from '../hooks';

interface ValidUntilFieldProps {
    validUntil: number;
    onChange: (next: number) => void;
    onSetFromNow: (seconds: number) => void;
    timer: TimerState;
}

const STATUS_DOT: Record<TimerStatus, string> = {
    ok: 'bg-success',
    warning: 'bg-[#f5a73b]',
    expired: 'bg-error'
};

export function ValidUntilField({
    validUntil,
    onChange,
    onSetFromNow,
    timer
}: ValidUntilFieldProps) {
    return (
        <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="text-xs text-secondary-foreground">Valid Until</span>
                <span
                    className={`inline-flex items-center gap-1.5 font-mono text-xs ${
                        timer.status === 'expired' ? 'text-error' : 'text-secondary-foreground'
                    }`}
                >
                    <span
                        className={`inline-block h-1.5 w-1.5 shrink-0 rounded-full ${STATUS_DOT[timer.status]}`}
                    />
                    {timer.display}
                </span>
            </div>
            <div className="flex flex-wrap gap-2">
                <div className="min-w-[140px] flex-1">
                    <Input size="s">
                        <Input.Field>
                            <Input.Input
                                type="number"
                                value={validUntil}
                                onChange={e => onChange(parseInt(e.target.value, 10) || 0)}
                            />
                        </Input.Field>
                    </Input>
                </div>
                <div className="flex flex-wrap gap-1">
                    <Button variant="ghost" size="s" onClick={() => onSetFromNow(-600)}>
                        −10m
                    </Button>
                    <Button variant="ghost" size="s" onClick={() => onSetFromNow(-300)}>
                        −5m
                    </Button>
                    <Button variant="ghost" size="s" onClick={() => onSetFromNow(60)}>
                        +1m
                    </Button>
                    <Button variant="ghost" size="s" onClick={() => onSetFromNow(300)}>
                        +5m
                    </Button>
                    <Button variant="ghost" size="s" onClick={() => onSetFromNow(43_200)}>
                        +12h
                    </Button>
                </div>
            </div>
        </div>
    );
}
