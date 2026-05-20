import { forwardRef } from 'react';
import type { ComponentProps, ReactNode } from 'react';

import { cn } from '../../../lib/utils';

export type ButtonSize = 'xs' | 's' | 'm' | 'l' | 'icon' | 'unset';
export type ButtonBorderRadius = 's' | 'm' | 'l' | 'xl' | '2xl' | 'full';
export type ButtonVariant = 'fill' | 'secondary' | 'bezeled' | 'gray' | 'ghost' | 'unstyled';

export interface ButtonProps extends ComponentProps<'button'> {
    /**
     * Size class applied to the button. Pass `'unset'` to skip the size class
     * entirely (no padding, no typography) — useful with `variant="unstyled"`.
     */
    size?: ButtonSize;
    borderRadius?: ButtonBorderRadius;
    /**
     * Visual variant. Use `'unstyled'` to opt out of all built-in styling —
     * the consumer is fully responsible for visuals via `className`. The
     * Button still provides ref forwarding, `disabled`/`loading` plumbing,
     * and `icon`/`children` rendering.
     */
    variant?: ButtonVariant;
    loading?: boolean;
    fullWidth?: boolean;
    icon?: ReactNode;
}

const SIZE_DEFAULT_RADIUS: Record<Exclude<ButtonSize, 'unset'>, ButtonBorderRadius> = {
    xs: 'm',
    s: '2xl',
    m: 'l',
    l: 'xl',
    icon: 'full'
};

const SIZE_CLASS: Record<Exclude<ButtonSize, 'unset'>, string> = {
    xs: 'text-xs font-semibold leading-4 px-2 py-1',
    s: 'text-sm font-semibold leading-[18px] px-3 py-[9px]',
    m: 'text-sm font-semibold leading-[18px] px-4 py-3',
    l: 'text-base font-semibold leading-6 px-4 py-3',
    icon: 'text-sm font-semibold leading-[18px] aspect-square p-1.5'
};

const RADIUS_CLASS: Record<ButtonBorderRadius, string> = {
    s: 'rounded-[4px]',
    m: 'rounded-lg',
    l: 'rounded-xl',
    xl: 'rounded-2xl',
    '2xl': 'rounded-[20px]',
    full: 'rounded-full'
};

const VARIANT_CLASS: Record<Exclude<ButtonVariant, 'unstyled'>, string> = {
    fill: 'bg-primary text-primary-foreground',
    secondary: 'bg-secondary text-foreground',
    bezeled: 'bg-background-bezeled text-primary',
    gray: 'bg-tertiary text-foreground',
    ghost: 'bg-transparent text-foreground hover:bg-tertiary'
};

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
    (
        {
            className,
            size = 'm',
            borderRadius,
            variant = 'fill',
            loading = false,
            fullWidth = false,
            disabled,
            icon,
            children,
            ...props
        },
        ref
    ) => {
        const radius = borderRadius ?? (size === 'unset' ? undefined : SIZE_DEFAULT_RADIUS[size]);

        return (
            <button
                ref={ref}
                disabled={disabled || loading}
                className={cn(
                    'inline-flex w-fit cursor-pointer items-center justify-center gap-2 border-0 outline-none transition-opacity duration-150 ease-in-out',
                    'hover:opacity-85 active:opacity-65 disabled:cursor-not-allowed disabled:opacity-35',
                    size !== 'unset' && SIZE_CLASS[size],
                    radius && RADIUS_CLASS[radius],
                    variant !== 'unstyled' && VARIANT_CLASS[variant],
                    fullWidth && 'w-full',
                    loading && 'cursor-wait',
                    className
                )}
                {...props}
            >
                {loading ? (
                    <span className="block size-[18px] animate-button-spin rounded-full border-[2.5px] border-current border-t-transparent" />
                ) : (
                    <>
                        {icon && (
                            <span className="inline-flex shrink-0 items-center justify-center">
                                {icon}
                            </span>
                        )}
                        {children}
                    </>
                )}
            </button>
        );
    }
);

Button.displayName = 'Button';
