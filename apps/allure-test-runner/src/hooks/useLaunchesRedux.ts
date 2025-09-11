import { useCallback, useEffect } from 'react';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { useGetLaunchesQuery, useCompleteLaunchMutation } from '../store/api/allureApi';
import {
    setSearch,
    setLaunches,
    setTotalElements,
    setHasMore,
    setLoading,
    setLoadingMore,
    setError,
    setCompleteError,
    clearCompleteError
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
            page: 0,
            size: INITIAL_PAGE_SIZE,
            sort: 'created_date,DESC'
        },
        { refetchOnMountOrArgChange: true }
    );

    useEffect(() => {
        if (launchesData) {
            dispatch(setLaunches(launchesData.content));
            dispatch(setTotalElements(launchesData.totalElements));
            dispatch(setHasMore(false));
        }
    }, [launchesData, dispatch]);

    useEffect(() => {
        dispatch(setLoading(isLoading || isFetching));
        dispatch(setLoadingMore(false));
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
        refetchLaunches();
    }, [refetchLaunches]);

    const loadMore = useCallback(() => {}, []);

    const complete = useCallback(
        async (id: number) => {
            try {
                dispatch(clearCompleteError());
                await completeLaunch({ id }).unwrap();
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
        refetchLaunches();
    }, [refetchLaunches]);

    return {
        search: launchesState.search,
        launches: launchesState.launches,
        loading: launchesState.loading,
        loadingMore: false,
        error: launchesState.error,
        completeError: launchesState.completeError,
        hasMore: false,
        totalElements: launchesState.totalElements,
        complete,
        handleSearchChange,
        handleRefresh,
        clearCompleteError: () => dispatch(clearCompleteError()),
        refetch,
        loadMore
    };
}
