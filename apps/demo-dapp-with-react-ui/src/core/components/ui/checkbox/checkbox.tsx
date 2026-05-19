import { forwardRef } from 'react';
import type { ComponentPropsWithoutRef, ComponentRef } from 'react';
import { Checkbox as CheckboxPrimitive } from 'radix-ui';
import { Check, Minus } from 'lucide-react';

import { cn } from '@/core/lib/utils';

export type CheckboxProps = ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>;

export const Checkbox = forwardRef<ComponentRef<typeof CheckboxPrimitive.Root>, CheckboxProps>(
    ({ className, ...props }, ref) => {
        return (
            <CheckboxPrimitive.Root
                ref={ref}
                className={cn(
                    'peer inline-flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-[4px] border border-tertiary bg-background outline-none transition-colors',
                    'hover:border-primary/60',
                    'focus-visible:ring-2 focus-visible:ring-primary/30',
                    'disabled:cursor-not-allowed disabled:opacity-50',
                    'data-[state=checked]:border-primary data-[state=checked]:bg-primary data-[state=checked]:text-primary-foreground',
                    'data-[state=indeterminate]:border-primary data-[state=indeterminate]:bg-primary data-[state=indeterminate]:text-primary-foreground',
                    className
                )}
                {...props}
            >
                <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
                    {props.checked === 'indeterminate' ? (
                        <Minus className="size-3" strokeWidth={3} />
                    ) : (
                        <Check className="size-3" strokeWidth={3} />
                    )}
                </CheckboxPrimitive.Indicator>
            </CheckboxPrimitive.Root>
        );
    }
);

Checkbox.displayName = 'Checkbox';
