import type { ChangeEvent } from 'react';

import { cn } from '@/core/lib/utils';

const HEX_PATTERN = /^#([0-9A-Fa-f]{3}|[0-9A-Fa-f]{6})$/;

interface ColorFieldProps {
    label: string;
    value: string;
    onChange: (value: string) => void;
}

export const ColorField = ({ label, value, onChange }: ColorFieldProps) => {
    const handleHexInput = (event: ChangeEvent<HTMLInputElement>) => {
        const next = event.target.value.trim();
        if (HEX_PATTERN.test(next)) {
            onChange(next.length === 4 ? expandShortHex(next) : next);
        }
    };

    return (
        <label className="group flex cursor-pointer items-center gap-3 rounded-xl border border-tertiary/50 bg-background/80 p-2.5 transition-colors hover:border-primary/30 hover:bg-background">
            <span
                className="relative size-10 shrink-0 overflow-hidden rounded-lg ring-1 ring-tertiary/60 ring-inset"
                style={{ backgroundColor: value }}
            >
                <input
                    type="color"
                    value={value}
                    onChange={event => onChange(event.target.value)}
                    className="absolute inset-0 size-full cursor-pointer border-0 opacity-0"
                    aria-label={label}
                />
            </span>
            <span className="min-w-0 flex-1">
                <span className="block text-sm font-medium text-foreground">{label}</span>
                <input
                    type="text"
                    value={value.toUpperCase()}
                    onChange={handleHexInput}
                    onClick={event => event.stopPropagation()}
                    className={cn(
                        'mt-0.5 w-full bg-transparent font-mono text-xs uppercase text-secondary-foreground',
                        'outline-none focus:text-foreground'
                    )}
                    spellCheck={false}
                    maxLength={7}
                />
            </span>
        </label>
    );
};

function expandShortHex(hex: string): string {
    const raw = hex.slice(1);
    return `#${raw
        .split('')
        .map(char => char + char)
        .join('')}`;
}
