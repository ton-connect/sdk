/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { createContext, useContext } from 'react';
import type { RefObject } from 'react';

export interface SelectContextValue {
    value: string | undefined;
    onValueChange: (value: string) => void;
    open: boolean;
    setOpen: (open: boolean) => void;
    disabled: boolean | undefined;
    triggerRef: RefObject<HTMLButtonElement | null>;
    contentRef: RefObject<HTMLDivElement | null>;
}

export const SelectContext = createContext<SelectContextValue | null>(null);

export const useSelectContext = (): SelectContextValue => {
    const ctx = useContext(SelectContext);
    if (!ctx) throw new Error('Select compound components must be used within Select.Root');
    return ctx;
};
