import { cn } from '@/lib/utils';
import { forwardRef } from 'react';
import { CaptionStrong, Body } from './typography';

// Professional Data Table Components

// Main Table Container
export const DataTable = forwardRef<
    HTMLDivElement,
    { className?: string; children: React.ReactNode }
>(({ className, children, ...props }, ref) => {
    return (
        <div ref={ref} className={cn('w-full h-full flex flex-col', className)} {...props}>
            {children}
        </div>
    );
});
DataTable.displayName = 'DataTable';

// Fixed Table Header
export const TableHeader = forwardRef<
    HTMLDivElement,
    { className?: string; children: React.ReactNode }
>(({ className, children, ...props }, ref) => {
    return (
        <div
            ref={ref}
            className={cn(
                'hidden lg:grid lg:grid-cols-12 lg:gap-4 lg:px-6 lg:py-3 lg:border-b lg:bg-muted/30 lg:flex-shrink-0',
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
});
TableHeader.displayName = 'TableHeader';

// Table Header Cell
export const TableHeaderCell = forwardRef<
    HTMLDivElement,
    { className?: string; children: React.ReactNode; span?: number }
>(({ className, children, span = 1, ...props }, ref) => {
    return (
        <div ref={ref} className={cn(`col-span-${span}`, className)} {...props}>
            <CaptionStrong>{children}</CaptionStrong>
        </div>
    );
});
TableHeaderCell.displayName = 'TableHeaderCell';

// Scrollable Table Body
export const TableBody = forwardRef<
    HTMLDivElement,
    { className?: string; children: React.ReactNode }
>(({ className, children, ...props }, ref) => {
    return (
        <div ref={ref} className={cn('flex-1 overflow-y-auto', className)} {...props}>
            <div className="space-y-4 lg:space-y-0">{children}</div>
        </div>
    );
});
TableBody.displayName = 'TableBody';

// Table Row for Mobile/Desktop
export const TableRow = forwardRef<
    HTMLDivElement,
    {
        className?: string;
        children: React.ReactNode;
        onClick?: () => void;
        selected?: boolean;
    }
>(({ className, children, onClick, selected, ...props }, ref) => {
    return (
        <div
            ref={ref}
            className={cn(
                'cursor-pointer transition-colors',
                'lg:grid lg:grid-cols-12 lg:gap-4 lg:px-6 lg:py-3 lg:border-b lg:border-border lg:hover:bg-muted/50',
                selected && 'lg:bg-primary/10 lg:border-l-4 lg:border-l-primary',
                className
            )}
            onClick={onClick}
            {...props}
        >
            {children}
        </div>
    );
});
TableRow.displayName = 'TableRow';

// Table Cell
export const TableCell = forwardRef<
    HTMLDivElement,
    {
        className?: string;
        children: React.ReactNode;
        span?: number;
    }
>(({ className, children, span = 1, ...props }, ref) => {
    return (
        <div
            ref={ref}
            className={cn(`lg:col-span-${span} lg:flex lg:items-center`, className)}
            {...props}
        >
            <Body className="text-foreground">{children}</Body>
        </div>
    );
});
TableCell.displayName = 'TableCell';
