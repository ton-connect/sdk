/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { FC } from 'react';

import { DEFAULT_ICON_SIZE } from './types';
import type { IconProps } from './types';

export const CloseIcon: FC<IconProps> = ({ size = DEFAULT_ICON_SIZE, ...props }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 12 12"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        {...props}
    >
        <path
            d="M1 1L11 11M1 11L11 1"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
    </svg>
);
