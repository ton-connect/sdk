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

export const TonIcon: FC<IconProps> = ({ size = DEFAULT_ICON_SIZE, ...props }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 29 29"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        {...props}
    >
        <path
            d="M23.7861 0H4.58614C1.08614 0 -1.11386 3.8 0.586136 6.9L12.3861 27.4C13.1861 28.7 15.0861 28.7 15.8861 27.4L27.6861 6.9C29.4861 3.8 27.2861 0 23.7861 0ZM12.4861 21.2L9.88614 16.2L3.68614 5.1C3.28614 4.4 3.78614 3.5 4.68614 3.5H12.4861V21.2ZM24.6861 5.1L18.4861 16.2L15.8861 21.2V3.5H23.6861C24.5861 3.5 25.0861 4.4 24.6861 5.1Z"
            fill="currentColor"
        />
    </svg>
);

export const TonIconCircle: FC<IconProps> = ({ size = DEFAULT_ICON_SIZE, ...props }) => (
    <svg
        width={size}
        height={size}
        viewBox="0 0 56 56"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
        {...props}
    >
        <path
            d="M28 56C43.5 56 56 43.5 56 28C56 12.5 43.5 0 28 0C12.5 0 0 12.5 0 28C0 43.5 12.5 56 28 56Z"
            fill="var(--ta-color-ton)"
        />
        <path
            d="M37.5996 15.6H18.3996C14.8996 15.6 12.6996 19.4 14.3996 22.5L26.1996 43C26.9996 44.3 28.8996 44.3 29.6996 43L41.4996 22.5C43.2996 19.4 41.0996 15.6 37.5996 15.6ZM26.2996 36.8L23.6996 31.8L17.4996 20.7C17.0996 20 17.5996 19.1 18.4996 19.1H26.2996V36.8ZM38.4996 20.7L32.2996 31.8L29.6996 36.8V19.1H37.4996C38.3996 19.1 38.8996 20 38.4996 20.7Z"
            fill="var(--ta-color-white)"
        />
    </svg>
);
