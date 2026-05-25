import { createContext, useContext, useMemo } from 'react';
import type { FC, ReactNode, ComponentProps, ChangeEvent } from 'react';

import { cn } from '../../../utils/cn';
import { Skeleton } from '../skeleton';
import { useInputResize } from './use-input-resize';
import type { InputSize } from './use-input-resize';

type InputVariant = 'default' | 'unstyled';

interface InputContextProps {
    size: InputSize;
    variant: InputVariant;
    disabled?: boolean;
    readOnly?: boolean;
    error?: boolean;
    loading?: boolean;
    resizable?: boolean;
}

const InputContext = createContext<InputContextProps | undefined>(undefined);

const useInputContext = () => {
    const context = useContext(InputContext);
    if (!context) {
        throw new Error('Input components must be used within an Input.Container');
    }
    return context;
};

const INPUT_SIZE_CLASS: Record<InputSize, string> = {
    s: 'text-base font-normal leading-6',
    m: 'text-2xl font-semibold leading-[30px]',
    l: 'text-[32px] font-bold leading-10'
};

const INPUT_SKELETON_HEIGHT: Record<InputSize, string> = {
    s: 'h-6',
    m: 'h-[30px]',
    l: 'h-10'
};

export interface InputContainerProps extends ComponentProps<'div'> {
    size?: InputSize;
    variant?: InputVariant;
    disabled?: boolean;
    /** Muted, non-editable field — no focus ring; use with `readOnly` on {@link InputControl}. */
    readOnly?: boolean;
    error?: boolean;
    loading?: boolean;
    resizable?: boolean;
    children: ReactNode;
}

const Container: FC<InputContainerProps> = ({
    size = 'm',
    variant = 'default',
    disabled,
    readOnly,
    error,
    loading,
    resizable,
    className,
    children,
    ...props
}) => {
    const contextValue = useMemo(
        () => ({ size, variant, disabled, readOnly, error, loading, resizable }),
        [size, variant, disabled, readOnly, error, loading, resizable]
    );

    return (
        <InputContext.Provider value={contextValue}>
            <div
                className={cn(
                    'flex w-full flex-col gap-1',
                    disabled && 'pointer-events-none opacity-50',
                    className
                )}
                {...props}
            >
                {children}
            </div>
        </InputContext.Provider>
    );
};

export interface InputHeaderProps extends ComponentProps<'div'> {
    children: ReactNode;
}

const Header: FC<InputHeaderProps> = ({ className, children, ...props }) => (
    <div className={cn('flex items-center justify-between px-1', className)} {...props}>
        {children}
    </div>
);

const Title: FC<ComponentProps<'span'>> = ({ className, children, ...props }) => (
    <span
        className={cn('text-sm font-normal leading-[18px] text-secondary-foreground', className)}
        {...props}
    >
        {children}
    </span>
);

export interface InputFieldProps extends ComponentProps<'div'> {
    children: ReactNode;
}

const Field: FC<InputFieldProps> = ({ className, children, ...props }) => {
    const { variant, readOnly, error } = useInputContext();
    const unstyled = variant === 'unstyled';

    return (
        <div
            className={cn(
                unstyled
                    ? 'flex items-center gap-2'
                    : cn(
                          'relative flex items-center gap-2 overflow-hidden rounded-xl border-2 border-transparent bg-secondary p-[14px] transition-colors focus-within:border-primary',
                          readOnly && 'bg-tertiary focus-within:border-transparent',
                          error && 'border-error focus-within:border-error'
                      ),
                className
            )}
            {...props}
        >
            {children}
        </div>
    );
};

export interface InputSlotProps extends ComponentProps<'div'> {
    side?: 'left' | 'right';
}

const Slot: FC<InputSlotProps> = ({ className, children, ...props }) => (
    <div className={cn('flex shrink-0 items-center justify-center', className)} {...props}>
        {children}
    </div>
);

export type InputControlProps = ComponentProps<'input'>;

const InputControl: FC<InputControlProps> = ({
    className,
    disabled: propsDisabled,
    readOnly: propsReadOnly,
    onChange,
    ...props
}) => {
    const {
        size: contextSize,
        disabled: contextDisabled,
        readOnly: contextReadOnly,
        loading,
        resizable
    } = useInputContext();
    const disabled = propsDisabled || contextDisabled;
    const readOnly = propsReadOnly ?? contextReadOnly;

    const { inputRef, measureMaxRef, measureMinRef, resizeStyle, adjustSize } = useInputResize({
        resizable,
        contextSize,
        value: props.value
    });

    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        onChange?.(e);
        adjustSize();
    };

    const text = String(props.value ?? props.defaultValue ?? '');

    const inputBaseClass =
        'w-full min-w-0 flex-1 border-0 bg-transparent p-0 text-foreground outline-none placeholder:text-secondary-foreground placeholder:opacity-60';

    if (loading) {
        return (
            <div
                className={cn(
                    inputBaseClass,
                    'pointer-events-none flex items-center',
                    INPUT_SKELETON_HEIGHT[contextSize],
                    className
                )}
            >
                <Skeleton width={75} height="70%" />
            </div>
        );
    }

    return (
        <>
            {resizable && (
                <>
                    {/* Measures actual text width at max (contextSize) font — source of truth for scaling */}
                    <span
                        ref={measureMaxRef}
                        className={cn(
                            'pointer-events-none invisible absolute whitespace-pre',
                            INPUT_SIZE_CLASS[contextSize]
                        )}
                        aria-hidden
                    >
                        {text}
                    </span>
                    {/* Empty span — only used to read minFontSize from CSS variable via computed style */}
                    <span
                        ref={measureMinRef}
                        className={cn(
                            'pointer-events-none invisible absolute whitespace-pre',
                            INPUT_SIZE_CLASS.s
                        )}
                        aria-hidden
                    />
                </>
            )}
            <input
                className={cn(
                    inputBaseClass,
                    INPUT_SIZE_CLASS[contextSize],
                    readOnly && 'cursor-default select-text',
                    className
                )}
                style={resizeStyle}
                disabled={disabled}
                readOnly={readOnly}
                {...props}
                ref={inputRef}
                onChange={readOnly ? undefined : handleChange}
            />
        </>
    );
};

const Caption: FC<ComponentProps<'span'>> = ({ className, children, ...props }) => {
    const { error } = useInputContext();
    return (
        <span
            className={cn(
                'px-1 text-xs font-normal leading-4',
                error ? 'text-error' : 'text-secondary-foreground',
                className
            )}
            {...props}
        >
            {children}
        </span>
    );
};

export const Input = Object.assign(Container, {
    Container,
    Header,
    Title,
    Field,
    Slot,
    Input: InputControl,
    Caption
});
