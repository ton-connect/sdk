/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { useLayoutEffect, useState } from 'react';

const BREAKPOINTS = {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
} as const;

export const useIsMobile = (breakpoint: keyof typeof BREAKPOINTS = 'md') => {
    const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined);

    useLayoutEffect(() => {
        const size = BREAKPOINTS[breakpoint];
        const mql = window.matchMedia(`(max-width: ${size - 1}px)`);
        const onChange = () => {
            setIsMobile(window.innerWidth < size);
        };
        mql.addEventListener('change', onChange);
        setIsMobile(window.innerWidth < size);
        return () => mql.removeEventListener('change', onChange);
    }, [breakpoint]);

    return !!isMobile;
};
