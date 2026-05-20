import { useLayoutEffect, useRef, useState } from 'react';

export type ImageLoadingStatus = 'idle' | 'loading' | 'loaded' | 'error';

const resolveLoadingStatus = (image: HTMLImageElement | null, src?: string): ImageLoadingStatus => {
    if (!image || !src) return 'idle';
    if (image.src !== src) image.src = src;
    return image.complete && image.naturalWidth > 0 ? 'loaded' : 'loading';
};

/**
 * Mirrors the image `load`/`error` events through a single `ImageLoadingStatus`
 * value. Used by {@link Logo} to swap to a fallback when the src fails or is
 * still loading.
 */
export const useImageLoadingStatus = (src: string | undefined): ImageLoadingStatus => {
    const imageRef = useRef<HTMLImageElement | null>(null);

    const getImage = (): HTMLImageElement | null => {
        if (typeof window === 'undefined') return null;
        if (!imageRef.current) imageRef.current = new window.Image();
        return imageRef.current;
    };

    const [loadingStatus, setLoadingStatus] = useState<ImageLoadingStatus>(() =>
        resolveLoadingStatus(getImage(), src)
    );

    useLayoutEffect(() => {
        setLoadingStatus(resolveLoadingStatus(getImage(), src));
    }, [src]);

    useLayoutEffect(() => {
        const image = getImage();
        if (!image) return;

        const handleLoad = () => setLoadingStatus('loaded');
        const handleError = () => setLoadingStatus('error');
        image.addEventListener('load', handleLoad);
        image.addEventListener('error', handleError);

        return () => {
            image.removeEventListener('load', handleLoad);
            image.removeEventListener('error', handleError);
        };
    }, [src]);

    return loadingStatus;
};
