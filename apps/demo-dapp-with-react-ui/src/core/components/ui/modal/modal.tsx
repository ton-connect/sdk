import type { FC, ReactNode } from 'react';

import { cn } from '../../../lib/utils';
import { Dialog } from '../dialog';
import { CloseIcon } from '../icons';

export interface ModalProps {
    /**
     * Controlled open state.
     */
    open?: boolean;
    /**
     * Event handler called when the open state changes.
     */
    onOpenChange?: (open: boolean) => void;
    /**
     * Modal title.
     */
    title?: string;
    /**
     * Modal content.
     */
    children?: ReactNode;
    /**
     * Additional class name for the content container.
     */
    className?: string;
    /**
     * Additional class name for the body container.
     */
    bodyClassName?: string;
}

export const Modal: FC<ModalProps> = ({
    open,
    onOpenChange,
    title,
    children,
    className,
    bodyClassName
}) => {
    return (
        <Dialog.Root open={open} onOpenChange={onOpenChange}>
            <Dialog.Portal>
                <Dialog.Overlay
                    className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm"
                    onClick={() => onOpenChange?.(false)}
                >
                    <Dialog.Content
                        className={cn(
                            'flex max-h-[calc(100vh-32px)] w-full max-w-[480px] flex-col overflow-hidden rounded-2xl bg-background shadow-[0_10px_25px_rgba(0,0,0,0.2)] outline-none',
                            className
                        )}
                        onClick={e => e.stopPropagation()}
                    >
                        <div className="flex items-center justify-between px-5 pb-[14px] pt-5">
                            {title && (
                                <Dialog.Title className="m-0 text-xl font-bold leading-6 text-foreground">
                                    {title}
                                </Dialog.Title>
                            )}
                            <Dialog.Close
                                className="flex size-8 cursor-pointer items-center justify-center rounded-full border-0 bg-secondary p-0 text-secondary-foreground transition-opacity hover:opacity-80"
                                aria-label="Close"
                            >
                                <CloseIcon size={12} />
                            </Dialog.Close>
                        </div>
                        <div
                            className={cn(
                                'overflow-y-auto px-5 pb-6 text-base font-normal leading-6 text-foreground',
                                bodyClassName
                            )}
                        >
                            {children}
                        </div>
                    </Dialog.Content>
                </Dialog.Overlay>
            </Dialog.Portal>
        </Dialog.Root>
    );
};
