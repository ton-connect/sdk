import * as React from 'react';
import { cn } from '@/lib/utils';

type LoaderSize = 'xs' | 'sm' | 'md' | 'lg';

const sizeMap: Record<LoaderSize, string> = {
    xs: 'h-3 w-3',
    sm: 'h-4 w-4',
    md: 'h-6 w-6',
    lg: 'h-8 w-8'
};

export function Loader({ size = 'md', className }: { size?: LoaderSize; className?: string }) {
    return (
        <svg
            className={cn('animate-spin text-primary', sizeMap[size], className)}
            viewBox="0 0 24 24"
            aria-label="Loading"
            role="status"
        >
            <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
                fill="none"
            />
            <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
            />
        </svg>
    );
}

export function PageLoader({ label }: { label?: string }) {
    return (
        <div className="min-h-screen flex items-center justify-center bg-background text-foreground">
            <div className="flex items-center gap-3">
                <Loader size="lg" />
                {label ? <span className="text-sm text-muted-foreground">{label}</span> : null}
            </div>
        </div>
    );
}
