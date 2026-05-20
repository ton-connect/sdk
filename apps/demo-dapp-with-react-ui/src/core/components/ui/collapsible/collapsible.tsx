import { forwardRef } from 'react';
import type { ComponentPropsWithoutRef, ComponentRef } from 'react';
import { Collapsible as CollapsiblePrimitive } from 'radix-ui';

import { cn } from '../../../utils/cn';

const CollapsibleRoot = CollapsiblePrimitive.Root;

const CollapsibleTrigger = forwardRef<
    ComponentRef<typeof CollapsiblePrimitive.CollapsibleTrigger>,
    ComponentPropsWithoutRef<typeof CollapsiblePrimitive.CollapsibleTrigger>
>(({ className, ...props }, ref) => (
    <CollapsiblePrimitive.CollapsibleTrigger
        ref={ref}
        className={cn(
            'inline-flex cursor-pointer items-center gap-1 text-sm text-secondary-foreground transition-colors hover:text-foreground disabled:cursor-default disabled:opacity-50',
            className
        )}
        {...props}
    />
));
CollapsibleTrigger.displayName = 'CollapsibleTrigger';

const CollapsibleContent = forwardRef<
    ComponentRef<typeof CollapsiblePrimitive.CollapsibleContent>,
    ComponentPropsWithoutRef<typeof CollapsiblePrimitive.CollapsibleContent>
>(({ className, ...props }, ref) => (
    <CollapsiblePrimitive.CollapsibleContent
        ref={ref}
        className={cn('overflow-hidden', className)}
        {...props}
    />
));
CollapsibleContent.displayName = 'CollapsibleContent';

export const Collapsible = Object.assign(CollapsibleRoot, {
    Trigger: CollapsibleTrigger,
    Content: CollapsibleContent
});
