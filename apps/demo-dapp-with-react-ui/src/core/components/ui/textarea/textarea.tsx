import { forwardRef } from 'react';
import type { ComponentPropsWithoutRef, ComponentRef } from 'react';

import { cn } from '@/core/lib/utils';

export type TextareaProps = ComponentPropsWithoutRef<'textarea'>;

export const Textarea = forwardRef<ComponentRef<'textarea'>, TextareaProps>(
    ({ className, rows = 3, ...props }, ref) => {
        return (
            <textarea
                ref={ref}
                rows={rows}
                className={cn(
                    'w-full resize-y rounded-[10px] border border-tertiary bg-secondary/40 px-3 py-2 text-sm text-foreground outline-none transition-colors',
                    'placeholder:text-tertiary-foreground',
                    'hover:border-tertiary-foreground/40',
                    'focus:border-primary focus:bg-background focus:ring-2 focus:ring-primary/20',
                    'disabled:cursor-not-allowed disabled:opacity-50',
                    className
                )}
                {...props}
            />
        );
    }
);

Textarea.displayName = 'Textarea';
