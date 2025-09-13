import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

// Professional Layout Components Following Design Guidelines

interface LayoutProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

// Main Page Container
export const PageContainer = forwardRef<HTMLDivElement, LayoutProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn('w-full h-screen-safe flex flex-col bg-background', className)}
                {...props}
            >
                {children}
            </div>
        );
    }
);
PageContainer.displayName = 'PageContainer';

// Content Container with proper spacing
export const ContentContainer = forwardRef<HTMLDivElement, LayoutProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn('flex-shrink-0 px-4 py-3 lg:px-6 lg:py-4', className)}
                {...props}
            >
                {children}
            </div>
        );
    }
);
ContentContainer.displayName = 'ContentContainer';

// Scrollable Content Area
export const ScrollArea = forwardRef<HTMLDivElement, LayoutProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <div ref={ref} className={cn('flex-1 overflow-hidden', className)} {...props}>
                {children}
            </div>
        );
    }
);
ScrollArea.displayName = 'ScrollArea';

// Card Container - Clean, minimal cards
export const Card = forwardRef<HTMLDivElement, LayoutProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn('bg-card rounded-xl border border-border/50 shadow-sm', className)}
                {...props}
            >
                {children}
            </div>
        );
    }
);
Card.displayName = 'Card';

// Card Content with proper padding
export const CardContent = forwardRef<HTMLDivElement, LayoutProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <div ref={ref} className={cn('p-4 lg:p-6', className)} {...props}>
                {children}
            </div>
        );
    }
);
CardContent.displayName = 'CardContent';

// Stack - Vertical spacing
export const Stack = forwardRef<
    HTMLDivElement,
    LayoutProps & { spacing?: 'compact' | 'tight' | 'normal' | 'relaxed' }
>(({ className, children, spacing = 'normal', ...props }, ref) => {
    const spacingClasses = {
        compact: 'space-y-1',
        tight: 'space-y-2',
        normal: 'space-y-4',
        relaxed: 'space-y-6'
    };

    return (
        <div ref={ref} className={cn(spacingClasses[spacing], className)} {...props}>
            {children}
        </div>
    );
});
Stack.displayName = 'Stack';

// Inline - Horizontal layout
export const Inline = forwardRef<
    HTMLDivElement,
    LayoutProps & { spacing?: 'tight' | 'normal' | 'relaxed' }
>(({ className, children, spacing = 'normal', ...props }, ref) => {
    const spacingClasses = {
        tight: 'gap-2',
        normal: 'gap-4',
        relaxed: 'gap-6'
    };

    return (
        <div
            ref={ref}
            className={cn('flex items-center', spacingClasses[spacing], className)}
            {...props}
        >
            {children}
        </div>
    );
});
Inline.displayName = 'Inline';
