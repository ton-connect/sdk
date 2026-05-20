import { forwardRef } from 'react';
import type { ComponentPropsWithoutRef, ComponentRef } from 'react';

import { cn } from '../../../utils/cn';

export type TextareaSize = 's' | 'm' | 'l';

export interface TextareaProps extends Omit<ComponentPropsWithoutRef<'textarea'>, 'size'> {
    size?: TextareaSize;
    error?: boolean;
}

const SIZE_CLASS: Record<TextareaSize, string> = {
    s: 'text-base font-normal leading-6',
    m: 'text-2xl font-semibold leading-[30px]',
    l: 'text-[32px] font-bold leading-10'
};

export const Textarea = forwardRef<ComponentRef<'textarea'>, TextareaProps>(
    ({ size = 's', error, disabled, rows = 3, className, ...props }, ref) => {
        return (
            <div
                className={cn(
                    'relative flex overflow-hidden rounded-xl border-2 border-transparent bg-secondary p-[14px] transition-colors focus-within:border-primary',
                    error && 'border-error focus-within:border-error',
                    disabled && 'pointer-events-none opacity-50'
                )}
            >
                <textarea
                    ref={ref}
                    rows={rows}
                    disabled={disabled}
                    className={cn(
                        'w-full min-w-0 flex-1 resize-y border-0 bg-transparent p-0 text-foreground outline-none placeholder:text-secondary-foreground placeholder:opacity-60',
                        SIZE_CLASS[size],
                        className
                    )}
                    {...props}
                />
            </div>
        );
    }
);

Textarea.displayName = 'Textarea';
