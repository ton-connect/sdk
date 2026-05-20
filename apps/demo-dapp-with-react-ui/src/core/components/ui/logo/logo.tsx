import { createContext, forwardRef, useContext, useEffect, useLayoutEffect, useState } from 'react';
import type { ComponentPropsWithoutRef, ComponentRef } from 'react';

import { cn } from '../../../utils/cn';
import { useImageLoadingStatus } from './use-image-loading-status';
import type { ImageLoadingStatus } from './use-image-loading-status';

interface LogoContextValue {
    imageLoadingStatus: ImageLoadingStatus;
    onImageLoadingStatusChange: (status: ImageLoadingStatus) => void;
}

const LogoContext = createContext<LogoContextValue | null>(null);

const useLogoContext = (): LogoContextValue => {
    const ctx = useContext(LogoContext);
    if (!ctx) throw new Error('Logo compound components must be used within Logo.Root');
    return ctx;
};

const LogoRoot = forwardRef<ComponentRef<'span'>, ComponentPropsWithoutRef<'span'>>(
    ({ className, ...props }, ref) => {
        const [imageLoadingStatus, setImageLoadingStatus] = useState<ImageLoadingStatus>('idle');

        return (
            <LogoContext.Provider
                value={{
                    imageLoadingStatus,
                    onImageLoadingStatusChange: setImageLoadingStatus
                }}
            >
                <span
                    ref={ref}
                    className={cn(
                        'inline-flex select-none items-center justify-center overflow-hidden rounded-full align-middle bg-background',
                        className
                    )}
                    {...props}
                />
            </LogoContext.Provider>
        );
    }
);
LogoRoot.displayName = 'LogoRoot';

interface LogoImageProps extends ComponentPropsWithoutRef<'img'> {
    onLoadingStatusChange?: (status: ImageLoadingStatus) => void;
}

const LogoImage = forwardRef<ComponentRef<'img'>, LogoImageProps>(
    ({ src, onLoadingStatusChange, className, ...props }, ref) => {
        const context = useLogoContext();
        const loadingStatus = useImageLoadingStatus(src);

        useLayoutEffect(() => {
            if (loadingStatus !== 'idle') {
                onLoadingStatusChange?.(loadingStatus);
                context.onImageLoadingStatusChange(loadingStatus);
            }
        }, [loadingStatus]);

        if (loadingStatus !== 'loaded') return null;

        return (
            <img
                ref={ref}
                src={src}
                className={cn('size-full rounded-[inherit] object-cover', className)}
                {...props}
            />
        );
    }
);
LogoImage.displayName = 'LogoImage';

interface LogoFallbackProps extends ComponentPropsWithoutRef<'span'> {
    delayMs?: number;
}

const LogoFallback = forwardRef<ComponentRef<'span'>, LogoFallbackProps>(
    ({ delayMs, className, ...props }, ref) => {
        const context = useLogoContext();
        const [canRender, setCanRender] = useState(delayMs === undefined);

        useEffect(() => {
            if (delayMs === undefined) return undefined;
            const id = window.setTimeout(() => setCanRender(true), delayMs);
            return () => window.clearTimeout(id);
        }, [delayMs]);

        if (!canRender || context.imageLoadingStatus === 'loaded') return null;

        return (
            <span
                ref={ref}
                className={cn(
                    'flex size-full items-center justify-center bg-tertiary text-[15px] font-medium leading-none text-foreground',
                    className
                )}
                {...props}
            />
        );
    }
);
LogoFallback.displayName = 'LogoFallback';

export interface LogoProps extends ComponentPropsWithoutRef<'span'> {
    /** Side length of the square container, in pixels. Default 30. */
    size?: number;
    src?: string;
    alt?: string;
    /** Optional fallback character/string when the image fails or is loading. */
    fallback?: string;
}

/**
 * Round avatar with an `<img>` and a delayed text/initials fallback. Mirrors
 * `Logo` from `appkit-react` (radix-Avatar-style); ported to Tailwind so the
 * demo app doesn't need a CSS module.
 */
export const Logo = forwardRef<ComponentRef<'span'>, LogoProps>(
    ({ size = 30, src, alt, fallback, style, ...props }, ref) => (
        <LogoRoot ref={ref} style={{ width: size, height: size, ...style }} {...props}>
            <LogoImage src={src} alt={alt} />
            {(fallback || alt) && <LogoFallback delayMs={600}>{fallback ?? alt?.[0]}</LogoFallback>}
        </LogoRoot>
    )
);
Logo.displayName = 'Logo';
