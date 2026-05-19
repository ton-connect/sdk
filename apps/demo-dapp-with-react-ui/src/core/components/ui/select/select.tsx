/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { forwardRef, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import type { ComponentPropsWithoutRef, ComponentRef, FC, ReactNode } from 'react';
import clsx from 'clsx';

import { Button } from '../button';
import type { ButtonProps } from '../button';
import styles from './select.module.css';
import { SelectContext, useSelectContext } from './use-select-context';

export interface SelectRootProps {
    /** Controlled selected value. */
    value?: string;
    /** Initial value when uncontrolled. */
    defaultValue?: string;
    /** Called whenever the selected value changes. */
    onValueChange?: (value: string) => void;
    /** Controlled open state. */
    open?: boolean;
    /** Initial open state when uncontrolled. */
    defaultOpen?: boolean;
    /** Called whenever the open state changes. */
    onOpenChange?: (open: boolean) => void;
    /** When true, the trigger is non-interactive. */
    disabled?: boolean;
    children: ReactNode;
}

const SelectRoot: FC<SelectRootProps> = ({
    value: controlledValue,
    defaultValue,
    onValueChange,
    open: controlledOpen,
    defaultOpen = false,
    onOpenChange,
    disabled,
    children,
}) => {
    const [uncontrolledValue, setUncontrolledValue] = useState<string | undefined>(defaultValue);
    const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);

    const isValueControlled = controlledValue !== undefined;
    const isOpenControlled = controlledOpen !== undefined;
    const value = isValueControlled ? controlledValue : uncontrolledValue;
    const open = isOpenControlled ? controlledOpen : uncontrolledOpen;

    const triggerRef = useRef<HTMLButtonElement | null>(null);
    const contentRef = useRef<HTMLDivElement | null>(null);

    const setOpen = useCallback(
        (next: boolean) => {
            if (!isOpenControlled) setUncontrolledOpen(next);
            onOpenChange?.(next);
        },
        [isOpenControlled, onOpenChange],
    );

    const handleValueChange = useCallback(
        (next: string) => {
            if (!isValueControlled) setUncontrolledValue(next);
            onValueChange?.(next);
        },
        [isValueControlled, onValueChange],
    );

    const ctx = useMemo(
        () => ({
            value,
            onValueChange: handleValueChange,
            open,
            setOpen,
            disabled,
            triggerRef,
            contentRef,
        }),
        [value, handleValueChange, open, setOpen, disabled],
    );

    return <SelectContext.Provider value={ctx}>{children}</SelectContext.Provider>;
};

export type SelectTriggerProps = ButtonProps;

const SelectTrigger = forwardRef<ComponentRef<'button'>, SelectTriggerProps>(
    ({ children, onClick, disabled, ...props }, forwardedRef) => {
        const ctx = useSelectContext();
        const isDisabled = disabled || ctx.disabled;

        const setRefs = useCallback(
            (node: HTMLButtonElement | null) => {
                ctx.triggerRef.current = node;
                if (typeof forwardedRef === 'function') forwardedRef(node);
                else if (forwardedRef) forwardedRef.current = node;
            },
            [ctx.triggerRef, forwardedRef],
        );

        return (
            <Button
                ref={setRefs}
                type="button"
                aria-haspopup="listbox"
                aria-expanded={ctx.open}
                data-state={ctx.open ? 'open' : 'closed'}
                disabled={isDisabled}
                onClick={(event) => {
                    onClick?.(event);
                    if (!event.defaultPrevented) ctx.setOpen(!ctx.open);
                }}
                {...props}
            >
                {children}
            </Button>
        );
    },
);

SelectTrigger.displayName = 'SelectTrigger';

export interface SelectContentProps extends ComponentPropsWithoutRef<'div'> {
    /** Horizontal alignment relative to the trigger. */
    align?: 'start' | 'end';
    /** Gap between trigger and content in pixels. */
    sideOffset?: number;
}

interface ContentPosition {
    top: number;
    left?: number;
    right?: number;
    minWidth: number;
}

const SelectContent: FC<SelectContentProps> = ({
    children,
    className,
    align = 'start',
    sideOffset = 4,
    style,
    ...props
}) => {
    const ctx = useSelectContext();
    const { open, setOpen, contentRef, triggerRef } = ctx;
    const [position, setPosition] = useState<ContentPosition | null>(null);

    const updatePosition = useCallback(() => {
        const trigger = triggerRef.current;
        if (!trigger) return;
        const rect = trigger.getBoundingClientRect();
        setPosition({
            top: rect.bottom + sideOffset,
            left: align === 'end' ? undefined : rect.left,
            right: align === 'end' ? window.innerWidth - rect.right : undefined,
            minWidth: rect.width,
        });
    }, [align, sideOffset, triggerRef]);

    useEffect(() => {
        if (!open) {
            setPosition(null);
            return;
        }

        updatePosition();

        const handler = () => updatePosition();
        // capture: true so we react to scroll events from inner scrollable containers
        // (e.g. the Modal body) — not just the window.
        window.addEventListener('scroll', handler, true);
        window.addEventListener('resize', handler);
        return () => {
            window.removeEventListener('scroll', handler, true);
            window.removeEventListener('resize', handler);
        };
    }, [open, updatePosition]);

    useEffect(() => {
        if (!open) return;

        const handlePointerDown = (event: MouseEvent) => {
            const target = event.target as Node | null;
            if (!target) return;
            if (contentRef.current?.contains(target)) return;
            if (triggerRef.current?.contains(target)) return;
            setOpen(false);
        };

        const handleKeyDown = (event: KeyboardEvent) => {
            if (event.key === 'Escape') setOpen(false);
        };

        document.addEventListener('mousedown', handlePointerDown);
        document.addEventListener('keydown', handleKeyDown);
        return () => {
            document.removeEventListener('mousedown', handlePointerDown);
            document.removeEventListener('keydown', handleKeyDown);
        };
    }, [open, setOpen, contentRef, triggerRef]);

    if (!open || !position || typeof document === 'undefined') return null;

    return createPortal(
        <div
            ref={contentRef}
            role="listbox"
            data-state="open"
            data-align={align}
            className={clsx(styles.content, className)}
            style={{
                position: 'fixed',
                top: position.top,
                left: position.left,
                right: position.right,
                minWidth: position.minWidth,
                ...style,
            }}
            {...props}
        >
            {children}
        </div>,
        document.body,
    );
};

export interface SelectItemProps extends ComponentPropsWithoutRef<'div'> {
    value: string;
    disabled?: boolean;
}

const SelectItem = forwardRef<ComponentRef<'div'>, SelectItemProps>(
    ({ value, disabled, children, className, onClick, ...props }, ref) => {
        const ctx = useSelectContext();
        const isSelected = ctx.value === value;

        return (
            <div
                ref={ref}
                role="option"
                aria-selected={isSelected}
                aria-disabled={disabled || undefined}
                data-state={isSelected ? 'checked' : 'unchecked'}
                data-disabled={disabled || undefined}
                tabIndex={disabled ? -1 : 0}
                className={clsx(styles.item, className)}
                onClick={(event) => {
                    onClick?.(event);
                    if (event.defaultPrevented || disabled) return;
                    ctx.onValueChange(value);
                    ctx.setOpen(false);
                }}
                {...props}
            >
                {children}
            </div>
        );
    },
);

SelectItem.displayName = 'SelectItem';

export const Select = {
    Root: SelectRoot,
    Trigger: SelectTrigger,
    Content: SelectContent,
    Item: SelectItem,
};
