import type { ComponentProps, FC } from 'react';
import { cn } from '../../../lib/utils';

import { Skeleton } from '../skeleton';
import type { SkeletonProps } from '../skeleton';

import styles from './info-block.module.css';

const Container: FC<ComponentProps<'div'>> = ({ className, ...props }) => (
    <div className={cn(styles.container, className)} {...props} />
);

const Row: FC<ComponentProps<'div'>> = ({ className, ...props }) => (
    <div className={cn(styles.row, className)} {...props} />
);

const Label: FC<ComponentProps<'span'>> = ({ className, ...props }) => (
    <span className={cn(styles.label, className)} {...props} />
);

const Value: FC<ComponentProps<'span'>> = ({ className, ...props }) => (
    <span className={cn(styles.value, className)} {...props} />
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
