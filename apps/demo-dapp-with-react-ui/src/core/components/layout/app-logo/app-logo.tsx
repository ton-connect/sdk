/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { ComponentProps, FC } from 'react';

import { cn } from '../../../utils/cn';

/** `public/app-logo.svg` — favicon and in-app logo share the same asset. */
const appLogoUrl = `${import.meta.env.BASE_URL}app-logo.svg`;

const logoMaskStyle = {
    WebkitMaskImage: `url(${appLogoUrl})`,
    maskImage: `url(${appLogoUrl})`,
    WebkitMaskRepeat: 'no-repeat',
    maskRepeat: 'no-repeat',
    WebkitMaskPosition: 'center',
    maskPosition: 'center',
    WebkitMaskSize: 'contain',
    maskSize: 'contain'
} as const;

export const AppLogo: FC<ComponentProps<'span'>> = ({
    className,
    'aria-label': ariaLabel = 'TON Connect Demo',
    style,
    ...props
}) => (
    <span
        role="img"
        aria-label={ariaLabel}
        className={cn(
            'inline-block aspect-[109/100] shrink-0 bg-current text-foreground',
            className
        )}
        style={{ ...logoMaskStyle, ...style }}
        {...props}
    />
);
