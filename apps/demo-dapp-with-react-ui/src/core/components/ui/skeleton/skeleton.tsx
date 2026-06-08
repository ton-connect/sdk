import { forwardRef } from 'react';
import type { ComponentProps } from 'react';

import { cn } from '../../../utils/cn';

export interface SkeletonProps extends ComponentProps<'div'> {
    width?: string | number;
    height?: string | number;
}

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
    ({ className, width, height, style, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={cn(
                    'relative inline-block overflow-hidden rounded-xl bg-tertiary',
                    "after:absolute after:inset-0 after:-translate-x-full after:content-[''] after:[background:var(--skeleton-shimmer)] after:animate-skeleton-shimmer",
                    className
                )}
                style={{ width, height, ...style }}
                {...props}
            />
        );
    }
);

Skeleton.displayName = 'Skeleton';
