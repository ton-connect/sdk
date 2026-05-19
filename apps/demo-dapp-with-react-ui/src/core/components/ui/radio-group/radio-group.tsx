import { forwardRef } from 'react';
import type { ComponentPropsWithoutRef, ComponentRef } from 'react';
import { RadioGroup as RadioGroupPrimitive } from 'radix-ui';

import { cn } from '@/core/lib/utils';

const RadioGroupRoot = forwardRef<
    ComponentRef<typeof RadioGroupPrimitive.Root>,
    ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Root>
>(({ className, ...props }, ref) => (
    <RadioGroupPrimitive.Root
        ref={ref}
        className={cn('flex flex-wrap gap-5', className)}
        {...props}
    />
));
RadioGroupRoot.displayName = 'RadioGroup';

const RadioGroupItem = forwardRef<
    ComponentRef<typeof RadioGroupPrimitive.Item>,
    ComponentPropsWithoutRef<typeof RadioGroupPrimitive.Item>
>(({ className, ...props }, ref) => (
    <RadioGroupPrimitive.Item
        ref={ref}
        className={cn(
            'peer relative inline-flex size-4 shrink-0 cursor-pointer items-center justify-center rounded-full border border-tertiary bg-background outline-none transition-colors',
            'hover:border-primary/60',
            'focus-visible:ring-2 focus-visible:ring-primary/30',
            'disabled:cursor-not-allowed disabled:opacity-50',
            'data-[state=checked]:border-primary data-[state=checked]:bg-primary',
            className
        )}
        {...props}
    >
        <RadioGroupPrimitive.Indicator className="block size-[6px] rounded-full bg-primary-foreground" />
    </RadioGroupPrimitive.Item>
));
RadioGroupItem.displayName = 'RadioGroupItem';

export const RadioGroup = Object.assign(RadioGroupRoot, {
    Item: RadioGroupItem
});
