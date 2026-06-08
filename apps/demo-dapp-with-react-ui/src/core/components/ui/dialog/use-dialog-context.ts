import { createContext, useContext } from 'react';

export interface DialogContextValue {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    titleId: string;
}

export const DialogContext = createContext<DialogContextValue | null>(null);

export const useDialogContext = (): DialogContextValue => {
    const ctx = useContext(DialogContext);
    if (!ctx) throw new Error('Dialog compound components must be used within Dialog.Root');
    return ctx;
};
