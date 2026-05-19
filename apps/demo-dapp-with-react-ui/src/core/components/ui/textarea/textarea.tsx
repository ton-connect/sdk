import { forwardRef } from 'react';
import type { ComponentPropsWithoutRef, ComponentRef } from 'react';
import clsx from 'clsx';

import styles from './textarea.module.css';

export type TextareaSize = 's' | 'm' | 'l';

export interface TextareaProps extends Omit<ComponentPropsWithoutRef<'textarea'>, 'size'> {
    size?: TextareaSize;
    error?: boolean;
}

export const Textarea = forwardRef<ComponentRef<'textarea'>, TextareaProps>(
    ({ size = 's', error, disabled, rows = 3, className, ...props }, ref) => {
        return (
            <div className={clsx(styles.field, error && styles.error, disabled && styles.disabled)}>
                <textarea
                    ref={ref}
                    rows={rows}
                    disabled={disabled}
                    className={clsx(styles.textarea, styles[`size_${size}`], className)}
                    {...props}
                />
            </div>
        );
    }
);

Textarea.displayName = 'Textarea';
