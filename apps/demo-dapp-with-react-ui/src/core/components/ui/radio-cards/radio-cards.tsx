import { createContext, useContext } from 'react';
import type { ComponentProps, FC, ReactNode } from 'react';

import { cn } from '../../../utils/cn';

interface RadioCardsContextValue {
    value: string;
    onValueChange: (next: string) => void;
}

const RadioCardsContext = createContext<RadioCardsContextValue | null>(null);

const useRadioCardsContext = (): RadioCardsContextValue => {
    const ctx = useContext(RadioCardsContext);
    if (!ctx) {
        throw new Error('RadioCards.Item and RadioCards.Tag must be used inside <RadioCards>');
    }
    return ctx;
};

export interface RadioCardsRootProps<T extends string = string>
    extends Omit<ComponentProps<'div'>, 'onChange'> {
    value: T;
    onChange: (next: T) => void;
    children: ReactNode;
}

const Root = <T extends string = string>({
    value,
    onChange,
    children,
    className,
    ...props
}: RadioCardsRootProps<T>) => {
    const ctx: RadioCardsContextValue = {
        value,
        onValueChange: onChange as (next: string) => void
    };

    return (
        <RadioCardsContext.Provider value={ctx}>
            <div role="radiogroup" className={cn('flex flex-col gap-2', className)} {...props}>
                {children}
            </div>
        </RadioCardsContext.Provider>
    );
};

export interface RadioCardsItemProps extends ComponentProps<'button'> {
    value: string;
}

const Item: FC<RadioCardsItemProps> = ({ value, children, className, onClick, ...props }) => {
    const ctx = useRadioCardsContext();
    const isActive = ctx.value === value;

    return (
        <button
            type="button"
            role="radio"
            aria-checked={isActive}
            onClick={event => {
                onClick?.(event);
                if (!event.defaultPrevented) ctx.onValueChange(value);
            }}
            className={cn(
                'flex cursor-pointer items-center gap-2 rounded-lg border border-tertiary bg-secondary p-4 text-left text-foreground transition-colors hover:border-primary/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50',
                className
            )}
            data-active={isActive ? 'true' : 'false'}
            {...props}
        >
            <span
                className={cn(
                    'flex h-5 w-5 shrink-0 items-center justify-center rounded-full border-2 border-tertiary transition-colors',
                    isActive && 'border-primary'
                )}
            >
                <span
                    className={cn(
                        'h-3 w-3 rounded-full transition-colors',
                        isActive ? 'bg-primary' : 'bg-transparent'
                    )}
                />
            </span>
            {children}
        </button>
    );
};

const Tag: FC<ComponentProps<'span'>> = ({ className, ...props }) => (
    <span
        className={cn(
            'ml-auto rounded-full bg-tertiary px-2 py-1 text-xs font-medium text-primary',
            className
        )}
        {...props}
    />
);

/**
 * Compound card-style radio group.
 *
 * ```tsx
 * <RadioCards value={mode} onChange={setMode}>
 *     <RadioCards.Item value="send">
 *         Send Transaction
 *         <RadioCards.Tag>On-chain</RadioCards.Tag>
 *     </RadioCards.Item>
 * </RadioCards>
 * ```
 */
export const RadioCards = Object.assign(Root, {
    Item,
    Tag
});
