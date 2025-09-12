import { useEffect, useRef, useCallback } from 'react';
import { LaunchCard } from '../../LaunchCard/LaunchCard';
import { Loader2 } from 'lucide-react';
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
    onLoadMore
}: Props) {
    const observerRef = useRef<IntersectionObserver | null>(null);
    const loadMoreRef = useRef<HTMLDivElement | null>(null);
    const scrollContainerRef = useRef<HTMLDivElement | null>(null);

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

    // Set up intersection observer with scroll container as root
    useEffect(() => {
        if (observerRef.current) {
            observerRef.current.disconnect();
        }

        observerRef.current = new IntersectionObserver(handleObserver, {
            threshold: 0.1,
            rootMargin: '200px', // Load more when trigger is 200px away from viewport
            root: scrollContainerRef.current // Use scroll container as root
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
        <div className="w-full h-full flex flex-col">
            {/* Fixed Desktop Table Header */}
            <div className="hidden lg:grid lg:grid-cols-12 lg:gap-4 lg:px-6 lg:py-3 lg:border-b lg:bg-muted/20 lg:font-medium lg:text-xs lg:text-muted-foreground lg:uppercase lg:tracking-wider lg:flex-shrink-0">
                <div className="col-span-1">ID</div>
                <div className="col-span-1">Status</div>
                <div className="col-span-4">Launch Name</div>
                <div className="col-span-2">Created</div>
                <div className="col-span-2">Created By</div>
                <div className="col-span-1">Defects</div>
                <div className="col-span-1">Actions</div>
            </div>

            {/* Scrollable Content */}
            <div ref={scrollContainerRef} className="flex-1 overflow-y-auto">
                <div className="space-y-4 lg:space-y-0">
                    {launches.map(launch => (
                        <LaunchCard
                            key={launch.id}
                            launch={launch}
                            onOpen={onOpen}
                            onComplete={onComplete}
                            isSelected={selectedLaunchId === launch.id}
                        />
                    ))}

                    {/* Load more trigger element */}
                    {hasMore && (
                        <div ref={loadMoreRef} className="flex justify-center py-4 lg:py-6">
                            {loadingMore && (
                                <div className="flex items-center space-x-2">
                                    <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />
                                    <span className="text-sm lg:text-base text-muted-foreground">
                                        Loading more...
                                    </span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
