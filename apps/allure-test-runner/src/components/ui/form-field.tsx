import { cn } from '@/lib/utils';
import { forwardRef } from 'react';
import { Input } from './input';
import { Label } from './label';
import { Button } from './button';
import type { ComponentProps } from 'react';
import { Caption } from './typography';

// Professional Form Components

interface FormFieldProps {
    label: string;
    error?: string;
    required?: boolean;
    className?: string;
    children: React.ReactNode;
}

interface CleanInputProps extends Omit<ComponentProps<typeof Input>, 'size'> {
    size?: 'default' | 'large';
}

interface CleanButtonProps extends Omit<ComponentProps<typeof Button>, 'size'> {
    size?: 'default' | 'large';
}

// Form Field Container
export const FormField = forwardRef<HTMLDivElement, FormFieldProps>(
    ({ className, label, error, required, children, ...props }, ref) => {
        return (
            <div ref={ref} className={cn('space-y-2', className)} {...props}>
                <Label className="text-[13px] font-medium leading-[1.23] tracking-[-0.008em]">
                    {label}
                    {required && <span className="text-red-500 ml-1">*</span>}
                </Label>
                {children}
                {error && <Caption className="text-red-600">{error}</Caption>}
            </div>
        );
    }
);
FormField.displayName = 'FormField';

// Clean Input - Professional input styling
export const CleanInput = forwardRef<HTMLInputElement, CleanInputProps>(
    ({ className, size = 'default', type, ...props }, ref) => {
        const sizeClasses: Record<string, string> = {
            default: 'h-9 text-[13px]',
            large: 'h-11 text-[15px]'
        };

        return (
            <Input
                type={type}
                className={cn(
                    'border-border bg-background focus:border-ring focus:ring-1 focus:ring-ring/20',
                    'font-normal leading-[1.23] tracking-[-0.008em]',
                    sizeClasses[size],
                    className
                )}
                ref={ref}
                {...props}
            />
        );
    }
);
CleanInput.displayName = 'CleanInput';

// Clean Button - Professional button styling
export const CleanButton = forwardRef<HTMLButtonElement, CleanButtonProps>(
    ({ className, size = 'default', children, ...props }, ref) => {
        const sizeClasses: Record<string, string> = {
            default: 'h-9 px-4 text-[13px]',
            large: 'h-11 px-6 text-[15px]'
        };

        return (
            <Button
                className={cn(
                    'font-medium leading-[1.23] tracking-[-0.008em]',
                    sizeClasses[size],
                    className
                )}
                ref={ref}
                {...props}
            >
                {children}
            </Button>
        );
    }
);
CleanButton.displayName = 'CleanButton';

// Form Actions - Button group container
export const FormActions = forwardRef<
    HTMLDivElement,
    {
        className?: string;
        children: React.ReactNode;
        alignment?: 'left' | 'right' | 'center' | 'between';
    }
>(({ className, children, alignment = 'right', ...props }, ref) => {
    const alignmentClasses = {
        left: 'justify-start',
        right: 'justify-end',
        center: 'justify-center',
        between: 'justify-between'
    };

    return (
        <div
            ref={ref}
            className={cn('flex items-center gap-3', alignmentClasses[alignment], className)}
            {...props}
        >
            {children}
        </div>
    );
});
FormActions.displayName = 'FormActions';
