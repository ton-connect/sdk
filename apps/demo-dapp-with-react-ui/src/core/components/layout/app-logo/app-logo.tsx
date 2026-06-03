/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { ComponentProps, FC } from 'react';

import { cn } from '../../../utils/cn';

const LOGO_PATHS = [
    'M54.1725 37.8602L32.4301 0L75.9148 3.80156e-06L54.1725 37.8602Z',
    'M64.6858 43.9301L86.6025 6.17057L108.345 43.8294L64.6858 43.9301Z',
    'M64.6858 56.0699L108.345 56.1706L86.6025 93.8294L64.6858 56.0699Z',
    'M54.1725 62.1398L75.9148 100L32.4301 100L54.1725 62.1398Z',
    'M43.6591 56.0699L21.7424 93.8294L3.10592e-06 56.1706L43.6591 56.0699Z',
    'M43.6591 43.9301L0 43.8294L21.7424 6.17057L43.6591 43.9301Z'
] as const;

export const AppLogo: FC<ComponentProps<'svg'>> = ({
    className,
    'aria-label': ariaLabel = 'TON Connect Demo',
    ...props
}) => (
    <svg
        viewBox="0 0 109 100"
        fill="currentColor"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label={ariaLabel}
        className={cn('aspect-[109/100] shrink-0 text-foreground', className)}
        {...props}
    >
        {LOGO_PATHS.map(d => (
            <path key={d} d={d} />
        ))}
    </svg>
);
