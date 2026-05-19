/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import { forwardRef, useCallback, useEffect, useId } from 'react';
import { createPortal } from 'react-dom';
import type { ComponentPropsWithoutRef, ComponentRef, FC, ReactNode } from 'react';

import { DialogContext, useDialogContext } from './use-dialog-context';

interface DialogRootProps {
    children: ReactNode;
    open?: boolean;
    onOpenChange?: (open: boolean) => void;
}

const DialogRoot: FC<DialogRootProps> = ({ children, open = false, onOpenChange }) => {
    const titleId = useId();
    const handleOpenChange = useCallback((value: boolean) => onOpenChange?.(value), [onOpenChange]);

    return (
        <DialogContext.Provider value={{ open, onOpenChange: handleOpenChange, titleId }}>
            {children}
        </DialogContext.Provider>
    );
};

interface DialogPortalProps {
    children: ReactNode;
    container?: Element | null;
}

const DialogPortal: FC<DialogPortalProps> = ({ children, container }) => {
    const { open } = useDialogContext();
    if (!open || typeof document === 'undefined') return null;
    return createPortal(children, container ?? document.body);
};

const DialogOverlay = forwardRef<ComponentRef<'div'>, ComponentPropsWithoutRef<'div'>>((props, ref) => {
    useEffect(() => {
        document.body.style.overflow = 'hidden';
        return () => {
            document.body.style.overflow = '';
        };
    }, []);

    return <div {...props} ref={ref} />;
});

DialogOverlay.displayName = 'DialogOverlay';

const DialogContent = forwardRef<ComponentRef<'div'>, ComponentPropsWithoutRef<'div'>>((props, ref) => {
    const { onOpenChange, titleId } = useDialogContext();

    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') onOpenChange(false);
        };
        document.addEventListener('keydown', handleKeyDown);
        return () => document.removeEventListener('keydown', handleKeyDown);
    }, [onOpenChange]);

    return <div role="dialog" aria-modal="true" aria-labelledby={titleId} {...props} ref={ref} />;
});

DialogContent.displayName = 'DialogContent';

const DialogTitle = forwardRef<ComponentRef<'h2'>, ComponentPropsWithoutRef<'h2'>>((props, ref) => {
    const { titleId } = useDialogContext();
    return <h2 id={titleId} {...props} ref={ref} />;
});

DialogTitle.displayName = 'DialogTitle';

const DialogClose = forwardRef<ComponentRef<'button'>, ComponentPropsWithoutRef<'button'>>(
    ({ onClick, ...props }, ref) => {
        const { onOpenChange } = useDialogContext();
        return (
            <button
                type="button"
                {...props}
                ref={ref}
                onClick={(e) => {
                    onClick?.(e);
                    onOpenChange(false);
                }}
            />
        );
    },
);

DialogClose.displayName = 'DialogClose';

export const Dialog = {
    Root: DialogRoot,
    Portal: DialogPortal,
    Overlay: DialogOverlay,
    Content: DialogContent,
    Title: DialogTitle,
    Close: DialogClose,
};
