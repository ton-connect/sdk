import { useEffect, useRef, useCallback } from 'react';
import { LaunchesList } from '../LaunchesList/LaunchesList';
import type { Launch } from '../../../models';

type Props = {
    launches: Launch[];
    selectedLaunchId: number | null;
    loading: boolean;
    loadingMore: boolean;
    hasMore: boolean;
    onOpen: (id: number) => void;
    onComplete: (id: number) => void;
    onLoadMore: () => void;
    onCreateLaunch?: () => void;
};

export function InfiniteScrollLaunchesList({
    launches,
    selectedLaunchId,
    loading,
    loadingMore,
    hasMore,
    onOpen,
    onComplete,
    onLoadMore,
    onCreateLaunch
}: Props) {
    const observerRef = useRef<IntersectionObserver | null>(null);
    const loadMoreRef = useRef<HTMLDivElement | null>(null);

    // Intersection Observer callback
    const handleObserver = useCallback(
        (entries: IntersectionObserverEntry[]) => {
            const target = entries[0];
            if (target.isIntersecting && hasMore && !loadingMore && !loading) {
                onLoadMore();
            }
        },
        [hasMore, loadingMore, loading, onLoadMore]
    );

    // Set up intersection observer with document as root (page scroll)
    useEffect(() => {
        if (observerRef.current) {
            observerRef.current.disconnect();
        }

        observerRef.current = new IntersectionObserver(handleObserver, {
            threshold: 0.1,
            rootMargin: '200px', // Load more when trigger is 200px away from viewport
            root: null // Use document as root for page scroll
        });

        if (loadMoreRef.current) {
            observerRef.current.observe(loadMoreRef.current);
        }

        return () => {
            if (observerRef.current) {
                observerRef.current.disconnect();
            }
        };
    }, [handleObserver]);

    if (launches.length === 0 && !loading) {
        return null;
    }

    return (
        <div className="infinite-scroll-launches">
            <LaunchesList
                launches={launches}
                selectedLaunchId={selectedLaunchId}
                onOpen={onOpen}
                onComplete={onComplete}
                onCreateLaunch={onCreateLaunch}
            />

            {/* Load more trigger element */}
            {hasMore && (
                <div ref={loadMoreRef} className="infinite-scroll-trigger">
                    {loadingMore && (
                        <div className="infinite-scroll-loading">
                            <div className="infinite-scroll-spinner"></div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
