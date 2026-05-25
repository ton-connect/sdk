import type { ComponentProps, FC } from 'react';

import { cn } from '../../../utils/cn';
import { Skeleton } from '../../ui/skeleton';
import type { SkeletonProps } from '../../ui/skeleton';

const Container: FC<ComponentProps<'div'>> = ({ className, ...props }) => (
    <div className={cn('flex w-full flex-col gap-4 rounded-xl py-4', className)} {...props} />
);

const Row: FC<ComponentProps<'div'>> = ({ className, ...props }) => (
    <div
        className={cn(
            'flex items-center justify-between text-base font-medium leading-5',
            className
        )}
        {...props}
    />
);

const Label: FC<ComponentProps<'span'>> = ({ className, ...props }) => (
    <span
        className={cn(
            'flex items-center gap-1 text-base font-medium leading-5 text-secondary-foreground',
            className
        )}
        {...props}
    />
);

const Value: FC<ComponentProps<'span'>> = ({ className, ...props }) => (
    <span
        className={cn('text-right text-base font-medium leading-5 text-foreground', className)}
        {...props}
    />
);

const LabelSkeleton: FC<SkeletonProps> = ({ width = 64, height = '1lh', ...props }) => (
    <Skeleton width={width} height={height} {...props} />
);

const ValueSkeleton: FC<SkeletonProps> = ({ width = 80, height = '1lh', ...props }) => (
    <Skeleton width={width} height={height} {...props} />
);

export const InfoBlock = {
    Container,
    Row,
    Label,
    Value,
    LabelSkeleton,
    ValueSkeleton
};
