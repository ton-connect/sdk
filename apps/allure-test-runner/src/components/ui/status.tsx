import { cn } from '@/lib/utils';
import { forwardRef } from 'react';
import { Caption, Body } from './typography';

// Professional Status and Metric Components

interface StatusBadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
    variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral';
    children: React.ReactNode;
}

interface MetricProps extends React.HTMLAttributes<HTMLDivElement> {
    label: string;
    value: string | number;
    variant?: 'default' | 'success' | 'warning' | 'danger';
}

// Status Badge - Small status indicators
export const StatusBadge = forwardRef<HTMLSpanElement, StatusBadgeProps>(
    ({ className, variant = 'neutral', children, ...props }, ref) => {
        const variantClasses = {
            success: 'bg-green-50 text-green-700 border-green-200',
            warning: 'bg-yellow-50 text-yellow-700 border-yellow-200',
            danger: 'bg-red-50 text-red-700 border-red-200',
            info: 'bg-blue-50 text-blue-700 border-blue-200',
            neutral: 'bg-muted text-muted-foreground border-border'
        };

        return (
            <span
                ref={ref}
                className={cn(
                    'inline-flex items-center px-2 py-0.5 rounded-full border text-[11px] font-medium leading-[1.36]',
                    variantClasses[variant],
                    className
                )}
                {...props}
            >
                {children}
            </span>
        );
    }
);
StatusBadge.displayName = 'StatusBadge';

// Metric Display - For statistics and KPIs
export const Metric = forwardRef<HTMLDivElement, MetricProps>(
    ({ className, label, value, variant = 'default', ...props }, ref) => {
        const variantClasses = {
            default: 'text-foreground',
            success: 'text-green-600',
            warning: 'text-yellow-600',
            danger: 'text-red-600'
        };

        return (
            <div ref={ref} className={cn('flex items-center gap-2', className)} {...props}>
                <Caption className="font-medium">{label}:</Caption>
                <Body className={cn('font-medium', variantClasses[variant])}>{value}</Body>
            </div>
        );
    }
);
Metric.displayName = 'Metric';

// Metrics Group - Collection of metrics
export const MetricsGroup = forwardRef<
    HTMLDivElement,
    {
        className?: string;
        children: React.ReactNode;
    }
>(({ className, children, ...props }, ref) => {
    return (
        <div ref={ref} className={cn('flex flex-wrap gap-4 sm:gap-6', className)} {...props}>
            {children}
        </div>
    );
});
MetricsGroup.displayName = 'MetricsGroup';

// Progress Indicator - Simple progress display
export const ProgressIndicator = forwardRef<
    HTMLDivElement,
    {
        className?: string;
        value: number;
        max?: number;
        label?: string;
    }
>(({ className, value, max = 100, label, ...props }, ref) => {
    const percentage = Math.min((value / max) * 100, 100);

    return (
        <div ref={ref} className={cn('space-y-1', className)} {...props}>
            {label && <Caption>{label}</Caption>}
            <div className="w-full bg-muted rounded-full h-1.5">
                <div
                    className="bg-primary h-1.5 rounded-full transition-all duration-300"
                    style={{ width: `${percentage}%` }}
                />
            </div>
        </div>
    );
});
ProgressIndicator.displayName = 'ProgressIndicator';
