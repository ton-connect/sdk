import type { ComponentProps, FC } from 'react';
import { cn } from '../../../utils/cn';
import { Check, Copy } from 'lucide-react';

import { useCopy } from '../../../hooks/use-copy';

export interface CopyButtonProps
    extends Omit<ComponentProps<'button'>, 'value' | 'children' | 'onClick'> {
    /** Text written to the clipboard on click. */
    value: string;
    iconSize?: number;
}

export const CopyButton: FC<CopyButtonProps> = ({
    value,
    className,
    type = 'button',
    iconSize = 16,
    ...props
}) => {
    const [copied, copy] = useCopy(value);

    return (
        <button
            type={type}
            className={cn(
                'flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-sm border-0 bg-transparent text-secondary-foreground transition-colors hover:bg-tertiary hover:text-foreground',
                className
            )}
            onClick={copy}
            {...props}
        >
            {copied ? <Check size={iconSize} /> : <Copy size={iconSize} />}
        </button>
    );
};
