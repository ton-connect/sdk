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
    const [currentPath, setCurrentPath] = useState<number | undefined>(undefined);
    const [pathHistory, setPathHistory] = useState<Array<{ id: number; name: string }>>([]);
    const [viewMode, setViewMode] = useState<'flat' | 'tree'>('tree');
    const [expandedGroups, setExpandedGroups] = useState<Set<number>>(new Set());
    const [groupContents, setGroupContents] = useState<Map<number, TestCase[]>>(new Map());
    const [loadingGroups, setLoadingGroups] = useState<Set<number>>(new Set());

    const { loading, result, error, refetch } = useQuery<PaginatedResponse<TestCase>>(
        signal => {
            if (viewMode === 'flat') {
                return client.getLaunchItems({ launchId, search: searchQuery }, signal);
            } else {
                return client.getLaunchItemsTree(
                    { launchId, search: searchQuery, path: currentPath },
                    signal
                );
            }
        },
        { deps: [client, launchId, searchQuery, currentPath, viewMode] }
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

    const openGroup = useCallback((group: { id: number; name: string }) => {
        setPathHistory(prev => [...prev, group]);
        setCurrentPath(group.id);
        setSelectedTestId(null);
    }, []);

    const goBack = useCallback(() => {
        if (pathHistory.length > 0) {
            const newHistory = pathHistory.slice(0, -1);
            setPathHistory(newHistory);
            setCurrentPath(
                newHistory.length > 0 ? newHistory[newHistory.length - 1].id : undefined
            );
            setSelectedTestId(null);
        }
    }, [pathHistory]);

    const goToRoot = useCallback(() => {
        setPathHistory([]);
        setCurrentPath(undefined);
        setSelectedTestId(null);
    }, []);

    const toggleViewMode = useCallback(() => {
        setViewMode(prev => (prev === 'flat' ? 'tree' : 'flat'));
        setCurrentPath(undefined);
        setPathHistory([]);
        setSelectedTestId(null);
    }, []);

    const navigateToLevel = useCallback(
        (index: number) => {
            const newHistory = pathHistory.slice(0, index + 1);
            setPathHistory(newHistory);
            setCurrentPath(
                newHistory.length > 0 ? newHistory[newHistory.length - 1].id : undefined
            );
            setSelectedTestId(null);
        },
        [pathHistory]
    );

    const toggleGroup = useCallback(
        async (groupId: number) => {
            const isExpanded = expandedGroups.has(groupId);

            if (isExpanded) {
                // Collapse group
                setExpandedGroups(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(groupId);
                    return newSet;
                });
            } else {
                // Expand group
                setExpandedGroups(prev => new Set(prev).add(groupId));

                // Load contents if not already loaded
                if (!groupContents.has(groupId)) {
                    setLoadingGroups(prev => new Set(prev).add(groupId));

                    try {
                        const result = await client.getLaunchItemTree(launchId, groupId);
                        setGroupContents(prev => new Map(prev).set(groupId, result.content));
                    } catch (error) {
                        console.error('Failed to load group contents:', error);
                        // On error, collapse the group
                        setExpandedGroups(prev => {
                            const newSet = new Set(prev);
                            newSet.delete(groupId);
                            return newSet;
                        });
                    } finally {
                        setLoadingGroups(prev => {
                            const newSet = new Set(prev);
                            newSet.delete(groupId);
                            return newSet;
                        });
                    }
                }
            }
        },
        [expandedGroups, groupContents, client, launchId, loadingGroups]
    );

    const isGroupExpanded = useCallback(
        (groupId: number) => {
            return expandedGroups.has(groupId);
        },
        [expandedGroups]
    );

    const getGroupContents = useCallback(
        (groupId: number) => {
            return groupContents.get(groupId) || [];
        },
        [groupContents]
    );

    const isGroupLoading = useCallback(
        (groupId: number) => {
            return loadingGroups.has(groupId);
        },
        [loadingGroups]
    );

    return {
        // State
        search,
        content,
        selectedTestId,
        loading,
        error,
        viewMode,
        currentPath,
        pathHistory,

        // Actions
        handleRefresh,
        handleSearchChange,
        openTest,
        closeTest,
        refreshTestCases,
        refetch,
        openGroup,
        goBack,
        goToRoot,
        toggleViewMode,
        navigateToLevel,
        toggleGroup,
        isGroupExpanded,
        getGroupContents,
        isGroupLoading
    };
}
