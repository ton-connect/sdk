import { useState, useCallback } from 'react';
import { useQuery } from '../../../../hooks/useQuery';
import { useDebounce } from '../../../../hooks/useDebounce';
import { useAllureApi } from '../../../../hooks/useAllureApi';
import type { PaginatedResponse, TestCase } from '../../../../models';

export function useTestCases(launchId: number) {
    const client = useAllureApi();
    const [search, setSearch] = useState('');
    const searchQuery = useDebounce(search.trim(), 300);
    const [selectedTestId, setSelectedTestId] = useState<number | null>(null);

    const { loading, result, error, refetch } = useQuery<PaginatedResponse<TestCase>>(
        signal => client.getLaunchItems({ launchId, search: searchQuery }, signal),
        { deps: [client, launchId, searchQuery] }
    );

    const content = Array.isArray(result?.content) ? result.content : [];

    const handleRefresh = useCallback(() => {
        setSearch('');
        setSelectedTestId(null);
        refetch();
    }, [refetch]);

    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
    }, []);

    const openTest = useCallback((id: number) => {
        setSelectedTestId(id);
    }, []);

    const closeTest = useCallback(() => {
        setSelectedTestId(null);
    }, []);

    const refreshTestCases = useCallback(() => {
        refetch();
    }, [refetch]);

    return {
        // State
        search,
        content,
        selectedTestId,
        loading,
        error,

        // Actions
        handleRefresh,
        handleSearchChange,
        openTest,
        closeTest,
        refreshTestCases,
        refetch
    };
}
