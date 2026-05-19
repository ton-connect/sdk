/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { forwardRef } from 'react';
import type { ComponentProps } from 'react';
import clsx from 'clsx';

import styles from './skeleton.module.css';

export interface SkeletonProps extends ComponentProps<'div'> {
    width?: string | number;
    height?: string | number;
}

export const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
    ({ className, width, height, style, ...props }, ref) => {
        return (
            <div
                ref={ref}
                className={clsx(styles.skeleton, className)}
                style={{ width, height, ...style }}
                {...props}
            />
        );
    },
);

Skeleton.displayName = 'Skeleton';
