import { cn } from '@/lib/utils';
import { forwardRef } from 'react';

// Professional Typography Components Following Design Guidelines

interface TypographyProps extends React.HTMLAttributes<HTMLElement> {
    children: React.ReactNode;
}

// Display Text - Large headings
export const Display = forwardRef<HTMLHeadingElement, TypographyProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <h1
                ref={ref}
                className={cn(
                    'text-[28px] font-semibold leading-[1.07] tracking-[-0.003em] text-foreground',
                    className
                )}
                {...props}
            >
                {children}
            </h1>
        );
    }
);
Display.displayName = 'Display';

// Large Title - Section headers
export const LargeTitle = forwardRef<HTMLHeadingElement, TypographyProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <h2
                ref={ref}
                className={cn(
                    'text-[22px] font-semibold leading-[1.18] tracking-[-0.002em] text-foreground',
                    className
                )}
                {...props}
            >
                {children}
            </h2>
        );
    }
);
LargeTitle.displayName = 'LargeTitle';

// Title - Subsection headers
export const Title = forwardRef<HTMLHeadingElement, TypographyProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <h3
                ref={ref}
                className={cn(
                    'text-[17px] font-semibold leading-[1.24] tracking-[-0.022em] text-foreground',
                    className
                )}
                {...props}
            >
                {children}
            </h3>
        );
    }
);
Title.displayName = 'Title';

// Body - Main content text
export const Body = forwardRef<HTMLParagraphElement, TypographyProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <p
                ref={ref}
                className={cn(
                    'text-[13px] font-normal leading-[1.23] tracking-[-0.008em] text-foreground',
                    className
                )}
                {...props}
            >
                {children}
            </p>
        );
    }
);
Body.displayName = 'Body';

// Caption - Small descriptive text
export const Caption = forwardRef<HTMLSpanElement, TypographyProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <span
                ref={ref}
                className={cn(
                    'text-[11px] font-normal leading-[1.36] tracking-[0.006em] text-muted-foreground',
                    className
                )}
                {...props}
            >
                {children}
            </span>
        );
    }
);
Caption.displayName = 'Caption';

// Caption Strong - Small labels and headers
export const CaptionStrong = forwardRef<HTMLSpanElement, TypographyProps>(
    ({ className, children, ...props }, ref) => {
        return (
            <span
                ref={ref}
                className={cn(
                    'text-[11px] font-semibold leading-[1.36] tracking-[0.06em] uppercase text-muted-foreground',
                    className
                )}
                {...props}
            >
                {children}
            </span>
        );
    }
);
CaptionStrong.displayName = 'CaptionStrong';
