import { useState, useCallback, useEffect, useRef } from 'react';
import { useDebounce } from '../../../hooks/useDebounce';
import { useAllureApi } from '../../../hooks/useAllureApi';
import { DEFAULT_PROJECT_ID } from '../../../constants';
import type { Launch } from '../../../models';

const INITIAL_PAGE_SIZE = 10;
const LOAD_MORE_SIZE = 10;

export function useInfiniteLaunches() {
    const client = useAllureApi();
    const [search, setSearch] = useState('');
    const searchQuery = useDebounce(search.trim(), 300);
    const [completeError, setCompleteError] = useState<string | null>(null);

    // State for infinite scroll
    const [launches, setLaunches] = useState<Launch[]>([]);
    const [loading, setLoading] = useState(false);
    const [loadingMore, setLoadingMore] = useState(false);
    const [error, setError] = useState<Error | null>(null);
    const [hasMore, setHasMore] = useState(true);
    const [currentPage, setCurrentPage] = useState(0);
    const [totalElements, setTotalElements] = useState(0);

    // Ref to track if we're currently loading to prevent duplicate requests
    const loadingRef = useRef(false);

    // Load initial data
    const loadInitialData = useCallback(async () => {
        if (loadingRef.current) return;

        loadingRef.current = true;
        setLoading(true);
        setError(null);

        try {
            const response = await client.getLaunches({
                projectId: DEFAULT_PROJECT_ID,
                search: searchQuery,
                page: 0,
                size: INITIAL_PAGE_SIZE,
                sort: 'created_date,DESC'
            });

            // Remove duplicates from initial load as well
            const uniqueLaunches = response.content.filter(
                (launch, index, self) => self.findIndex(l => l.id === launch.id) === index
            );

            setLaunches(uniqueLaunches);
            setCurrentPage(0);
            setTotalElements(response.totalElements);
            setHasMore(
                uniqueLaunches.length === INITIAL_PAGE_SIZE &&
                    uniqueLaunches.length < response.totalElements
            );
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to load launches'));
        } finally {
            setLoading(false);
            loadingRef.current = false;
        }
    }, [client, searchQuery]);

    // Load more data
    const loadMore = useCallback(async () => {
        if (loadingRef.current || !hasMore) return;

        loadingRef.current = true;
        setLoadingMore(true);

        try {
            const nextPage = currentPage + 1;
            const response = await client.getLaunches({
                projectId: DEFAULT_PROJECT_ID,
                search: searchQuery,
                page: nextPage,
                size: LOAD_MORE_SIZE,
                sort: 'created_date,DESC'
            });

            setLaunches(prev => {
                // Create a Set of existing IDs to avoid duplicates
                const existingIds = new Set(prev.map(launch => launch.id));
                const newLaunches = response.content.filter(launch => !existingIds.has(launch.id));
                return [...prev, ...newLaunches];
            });
            setCurrentPage(nextPage);
            setHasMore(
                response.content.length === LOAD_MORE_SIZE &&
                    launches.length + response.content.length < response.totalElements
            );
        } catch (err) {
            setError(err instanceof Error ? err : new Error('Failed to load more launches'));
        } finally {
            setLoadingMore(false);
            loadingRef.current = false;
        }
    }, [client, searchQuery, currentPage, hasMore, launches.length]);

    // Reset data when search changes
    useEffect(() => {
        loadInitialData();
    }, [loadInitialData]);

    // Complete launch function
    const complete = useCallback(
        async (id: number) => {
            try {
                setCompleteError(null);
                await client.completeLaunch(id);
                // Refresh the data after completing
                loadInitialData();
            } catch (error) {
                const errorMessage =
                    error instanceof Error ? error.message : 'Failed to complete launch';
                setCompleteError(errorMessage);
                console.error('Failed to complete launch:', error);
            }
        },
        [client, loadInitialData]
    );

    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
    }, []);

    const handleRefresh = useCallback(() => {
        setSearch('');
        loadInitialData();
    }, [loadInitialData]);

    const clearCompleteError = useCallback(() => {
        setCompleteError(null);
    }, []);

    const refetch = useCallback(() => {
        loadInitialData();
    }, [loadInitialData]);

    return {
        // State
        search,
        launches,
        loading,
        loadingMore,
        error,
        completeError,
        hasMore,
        totalElements,

        // Actions
        complete,
        handleSearchChange,
        handleRefresh,
        clearCompleteError,
        refetch,
        loadMore
    };
}
