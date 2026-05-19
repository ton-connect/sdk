/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { ComponentProps, FC } from 'react';

import { cn } from '@/core/lib/utils';

export const AppLogo: FC<ComponentProps<'img'>> = ({ className, alt = 'TON', ...props }) => {
    return <img src="/ton.png" alt={alt} className={cn('size-10 rounded-lg', className)} {...props} />;
};
