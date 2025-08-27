import { useState, useCallback } from 'react';
import { useQuery } from '../../../hooks/useQuery';
import { useDebounce } from '../../../hooks/useDebounce';
import { useAllureApi } from '../../../hooks/useAllureApi';
import { DEFAULT_PROJECT_ID } from '../../../constants';

export function useLaunches() {
    const client = useAllureApi();
    const [search, setSearch] = useState('');
    const searchQuery = useDebounce(search.trim(), 300);
    const [completeError, setCompleteError] = useState<string | null>(null);

    const { loading, error, refetch, result } = useQuery(
        signal =>
            client.getLaunches({ projectId: DEFAULT_PROJECT_ID, search: searchQuery }, signal),
        { deps: [client, searchQuery] }
    );

    const launches = result?.content ?? [];

    const complete = useCallback(
        async (id: number) => {
            try {
                setCompleteError(null);
                await client.completeLaunch(id);
                refetch();
            } catch (error) {
                const errorMessage =
                    error instanceof Error ? error.message : 'Failed to complete launch';
                setCompleteError(errorMessage);
                console.error('Failed to complete launch:', error);
            }
        },
        [client, refetch]
    );

    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
    }, []);

    const handleRefresh = useCallback(() => {
        setSearch('');
        refetch();
    }, [refetch]);

    const clearCompleteError = useCallback(() => {
        setCompleteError(null);
    }, []);

    return {
        // State
        search,
        launches,
        loading,
        error,
        completeError,

        // Actions
        complete,
        handleSearchChange,
        handleRefresh,
        clearCompleteError,
        refetch
    };
}
