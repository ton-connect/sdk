import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { useGetLaunchesQuery, useCompleteLaunchMutation } from '../store/api/allureApi';
import {
    setSearch,
    setLaunches,
    addLaunches,
    setCurrentPage,
    setTotalElements,
    setHasMore,
    setLoading,
    setLoadingMore,
    setError,
    setCompleteError,
    clearCompleteError,
    resetLaunches
} from '../store/slices/launchesSlice';
import { selectLaunches } from '../store/selectors';
import { DEFAULT_PROJECT_ID } from '../constants';
import { useDebounce } from './useDebounce';

const INITIAL_PAGE_SIZE = 10;

export function useLaunchesRedux() {
    const dispatch = useAppDispatch();
    const launchesState = useAppSelector(selectLaunches);
    const searchQuery = useDebounce(launchesState.search.trim(), 300);

    const [completeLaunch] = useCompleteLaunchMutation();

    const {
        data: launchesData,
        error: launchesError,
        isLoading,
        isFetching,
        refetch: refetchLaunches
    } = useGetLaunchesQuery(
        {
            projectId: DEFAULT_PROJECT_ID,
            search: searchQuery,
            page: launchesState.currentPage,
            size: INITIAL_PAGE_SIZE,
            sort: 'created_date,DESC'
        },
        { refetchOnMountOrArgChange: true }
    );

    useEffect(() => {
        if (launchesState.search !== searchQuery) {
            dispatch(resetLaunches());
            dispatch(setCurrentPage(0));
        }
    }, [searchQuery, launchesState.search, dispatch]);

    useEffect(() => {
        if (launchesData) {
            if (launchesState.currentPage === 0) {
                dispatch(setLaunches(launchesData.content));
            } else {
                dispatch(addLaunches(launchesData.content));
            }
            dispatch(setTotalElements(launchesData.totalElements));

            // Calculate if there are more pages using totalElements
            // We need to check if we have loaded all available items
            const totalLoaded =
                launchesState.currentPage === 0
                    ? launchesData.content.length
                    : launchesState.launches.length;
            const hasMorePages = totalLoaded < launchesData.totalElements;

            // Debug logging

            dispatch(setHasMore(hasMorePages));
        }
    }, [launchesData, dispatch, launchesState.currentPage, launchesState.launches.length]);

    useEffect(() => {
        dispatch(setLoading(isLoading || isFetching));
        // Reset loadingMore when data is loaded
        if (!isLoading && !isFetching) {
            dispatch(setLoadingMore(false));
        }
    }, [isLoading, isFetching, dispatch]);

    useEffect(() => {
        if (launchesError) {
            const errorMessage =
                launchesError instanceof Error ? launchesError.message : 'Failed to load launches';
            dispatch(setError(errorMessage));
        }
    }, [launchesError, dispatch]);

    const handleSearchChange = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            dispatch(setSearch(e.target.value));
        },
        [dispatch]
    );

    const handleRefresh = useCallback(() => {
        dispatch(resetLaunches());
        dispatch(setCurrentPage(0));
        refetchLaunches();
    }, [refetchLaunches, dispatch]);

    const loadMore = useCallback(() => {
        if (launchesState.hasMore && !launchesState.loadingMore && !launchesState.loading) {
            dispatch(setLoadingMore(true));
            dispatch(setCurrentPage(launchesState.currentPage + 1));
        }
    }, [
        launchesState.hasMore,
        launchesState.loadingMore,
        launchesState.loading,
        launchesState.currentPage,
        dispatch
    ]);

    const complete = useCallback(
        async (id: number) => {
            try {
                dispatch(clearCompleteError());
                await completeLaunch({ id }).unwrap();
                // Reset and refetch to get updated data
                dispatch(resetLaunches());
                dispatch(setCurrentPage(0));
                refetchLaunches();
            } catch (error) {
                const errorMessage =
                    error instanceof Error ? error.message : 'Failed to complete launch';
                dispatch(setCompleteError(errorMessage));
                console.error('Failed to complete launch:', error);
            }
        },
        [completeLaunch, dispatch, refetchLaunches]
    );

    const refetch = useCallback(() => {
        dispatch(resetLaunches());
        dispatch(setCurrentPage(0));
        refetchLaunches();
    }, [refetchLaunches, dispatch]);

    return {
        search: launchesState.search,
        launches: launchesState.launches,
        loading: launchesState.loading,
        loadingMore: launchesState.loadingMore,
        error: launchesState.error,
        completeError: launchesState.completeError,
        hasMore: launchesState.hasMore,
        totalElements: launchesState.totalElements,
        complete,
        handleSearchChange,
        handleRefresh,
        clearCompleteError: () => dispatch(clearCompleteError()),
        refetch,
        loadMore
    };
}
