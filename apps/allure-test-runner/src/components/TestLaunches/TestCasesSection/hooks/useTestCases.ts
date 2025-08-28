import { useState, useCallback, useEffect } from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import { useQuery } from '../../../../hooks/useQuery';
import { useAllureApi } from '../../../../hooks/useAllureApi';
import type { PaginatedResponse, TestCase } from '../../../../models';

// URL state management utilities
type TreeUrlState = {
    launchId: number | null;
    viewMode: 'flat' | 'tree';
    expandedGroups: number[];
    pathHistory: Array<{ id: number; name: string }>;
    selectedTestId: number | null;
};

function parseTreeStateFromSearchParams(params: URLSearchParams): Partial<TreeUrlState> {
    const state: Partial<TreeUrlState> = {};

    const viewMode = params.get('viewMode');
    if (viewMode === 'flat' || viewMode === 'tree') {
        state.viewMode = viewMode;
    }

    const expandedGroups = params.get('expanded');
    if (expandedGroups) {
        try {
            state.expandedGroups = expandedGroups
                .split(',')
                .map(Number)
                .filter(n => !isNaN(n));
        } catch (e) {
            console.warn('Failed to parse expanded groups from URL:', e);
        }
    }

    const pathHistory = params.get('path');
    if (pathHistory) {
        try {
            state.pathHistory = JSON.parse(decodeURIComponent(pathHistory));
        } catch (e) {
            console.warn('Failed to parse path history from URL:', e);
        }
    }

    const selectedTestId = params.get('selectedTest');
    if (selectedTestId) {
        const id = Number(selectedTestId);
        if (!isNaN(id)) {
            state.selectedTestId = id;
        }
    }

    return state;
}

export function useTestCases(launchId: number) {
    const client = useAllureApi();
    const navigate = useNavigate();
    const params = useParams<{ testId?: string }>();
    const [searchParams, setSearchParams] = useSearchParams();

    // Initialize state from URL
    const urlState = parseTreeStateFromSearchParams(searchParams);

    // Get selected test ID from URL params (if we're on a test details page)
    const selectedTestIdFromUrl = params.testId ? parseInt(params.testId) : null;
    const selectedTestId =
        selectedTestIdFromUrl && !isNaN(selectedTestIdFromUrl)
            ? selectedTestIdFromUrl
            : (urlState.selectedTestId ?? null);

    const [search, setSearch] = useState('');
    const searchQuery = search.trim();
    const [currentPath, setCurrentPath] = useState<number | undefined>(
        urlState.pathHistory && urlState.pathHistory.length > 0
            ? urlState.pathHistory[urlState.pathHistory.length - 1].id
            : undefined
    );
    const [pathHistory, setPathHistory] = useState<Array<{ id: number; name: string }>>(
        urlState.pathHistory ?? []
    );
    const [viewMode, setViewMode] = useState<'flat' | 'tree'>(urlState.viewMode ?? 'tree');
    const [expandedGroups, setExpandedGroups] = useState<Set<number>>(
        new Set(urlState.expandedGroups ?? [])
    );
    const [groupContents, setGroupContents] = useState<Map<number, TestCase[]>>(new Map());
    const [loadingGroups, setLoadingGroups] = useState<Set<number>>(new Set());

    // Helper function to update search params
    const updateSearchParams = useCallback(
        (updates: Partial<TreeUrlState>) => {
            setSearchParams(prevParams => {
                const newParams = new URLSearchParams(prevParams);

                if (updates.viewMode !== undefined) {
                    newParams.set('viewMode', updates.viewMode);
                }

                if (updates.expandedGroups !== undefined) {
                    if (updates.expandedGroups.length > 0) {
                        newParams.set('expanded', updates.expandedGroups.join(','));
                    } else {
                        newParams.delete('expanded');
                    }
                }

                if (updates.pathHistory !== undefined) {
                    if (updates.pathHistory.length > 0) {
                        newParams.set(
                            'path',
                            encodeURIComponent(JSON.stringify(updates.pathHistory))
                        );
                    } else {
                        newParams.delete('path');
                    }
                }

                if (updates.selectedTestId !== undefined) {
                    if (updates.selectedTestId !== null) {
                        newParams.set('selectedTest', updates.selectedTestId.toString());
                    } else {
                        newParams.delete('selectedTest');
                    }
                }

                return newParams;
            });
        },
        [setSearchParams]
    );

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

    // Update URL when state changes
    useEffect(() => {
        updateSearchParams({
            viewMode,
            expandedGroups: Array.from(expandedGroups),
            pathHistory
        });
    }, [viewMode, expandedGroups, pathHistory, updateSearchParams]);

    // Load expanded groups content on mount if they exist in URL
    useEffect(() => {
        const loadExpandedGroups = async () => {
            for (const groupId of expandedGroups) {
                if (!groupContents.has(groupId)) {
                    setLoadingGroups(prev => new Set(prev).add(groupId));
                    try {
                        const result = await client.getLaunchItemTree(launchId, groupId);
                        setGroupContents(prev => new Map(prev).set(groupId, result.content));
                    } catch (error) {
                        console.error(`Failed to load group ${groupId} from URL:`, error);
                    } finally {
                        setLoadingGroups(prev => {
                            const newSet = new Set(prev);
                            newSet.delete(groupId);
                            return newSet;
                        });
                    }
                }
            }
        };

        if (expandedGroups.size > 0) {
            loadExpandedGroups();
        }
    }, [launchId]); // Only run on mount/launchId change

    // Handle URL parameter changes (when user navigates back/forward or manually changes URL)
    useEffect(() => {
        const urlState = parseTreeStateFromSearchParams(searchParams);

        if (urlState.viewMode !== undefined && urlState.viewMode !== viewMode) {
            setViewMode(urlState.viewMode);
        }

        if (
            urlState.pathHistory !== undefined &&
            JSON.stringify(urlState.pathHistory) !== JSON.stringify(pathHistory)
        ) {
            setPathHistory(urlState.pathHistory);
            setCurrentPath(
                urlState.pathHistory.length > 0
                    ? urlState.pathHistory[urlState.pathHistory.length - 1].id
                    : undefined
            );
        }

        if (urlState.expandedGroups !== undefined) {
            const urlGroupsSet = new Set(urlState.expandedGroups);
            const currentGroupsSet = new Set(Array.from(expandedGroups));
            const urlGroupsArray = Array.from(urlGroupsSet).sort();
            const currentGroupsArray = Array.from(currentGroupsSet).sort();

            if (JSON.stringify(urlGroupsArray) !== JSON.stringify(currentGroupsArray)) {
                setExpandedGroups(urlGroupsSet);
            }
        }

        // selectedTestId is now managed by routing, so we don't update it from URL params
    }, [searchParams]);

    const handleRefresh = useCallback(() => {
        setSearch('');
        // Navigate back to launch page (closes any selected test)
        navigate(`/launches/${launchId}`);
        refetch();
    }, [refetch, navigate, launchId]);

    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
    }, []);

    const openTest = useCallback(
        (id: number) => {
            navigate(`/launches/${launchId}/tests/${id}`);
        },
        [navigate, launchId]
    );

    const closeTest = useCallback(() => {
        navigate(`/launches/${launchId}`);
    }, [navigate, launchId]);

    const refreshTestCases = useCallback(async () => {
        const currentExpandedGroups = new Set(expandedGroups);

        setGroupContents(new Map());
        setLoadingGroups(new Set());

        refetch();

        for (const groupId of currentExpandedGroups) {
            try {
                const result = await client.getLaunchItemTree(launchId, groupId);
                setGroupContents(prev => new Map(prev).set(groupId, result.content));
            } catch (error) {
                console.error(`Failed to reload group ${groupId}:`, error);
            }
        }
    }, [refetch, expandedGroups, client, launchId]);

    const openGroup = useCallback(
        (group: { id: number; name: string }) => {
            setPathHistory(prev => {
                const newHistory = [...prev, group];
                updateSearchParams({ pathHistory: newHistory });
                return newHistory;
            });
            setCurrentPath(group.id);
            // Keep the same selected test when navigating
            if (selectedTestId) {
                navigate(`/launches/${launchId}/tests/${selectedTestId}`);
            } else {
                navigate(`/launches/${launchId}`);
            }
        },
        [navigate, launchId, selectedTestId]
    );

    const goBack = useCallback(() => {
        if (pathHistory.length > 0) {
            const newHistory = pathHistory.slice(0, -1);
            setPathHistory(newHistory);
            setCurrentPath(
                newHistory.length > 0 ? newHistory[newHistory.length - 1].id : undefined
            );
            updateSearchParams({ pathHistory: newHistory });
            // Keep the same selected test when going back
            if (selectedTestId) {
                navigate(`/launches/${launchId}/tests/${selectedTestId}`);
            } else {
                navigate(`/launches/${launchId}`);
            }
        }
    }, [pathHistory, navigate, launchId, selectedTestId]);

    const goToRoot = useCallback(() => {
        setPathHistory([]);
        setCurrentPath(undefined);
        updateSearchParams({ pathHistory: [] });
        // Keep the same selected test when going to root
        if (selectedTestId) {
            navigate(`/launches/${launchId}/tests/${selectedTestId}`);
        } else {
            navigate(`/launches/${launchId}`);
        }
    }, [navigate, launchId, selectedTestId]);

    const toggleViewMode = useCallback(() => {
        const newViewMode = viewMode === 'flat' ? 'tree' : 'flat';
        setViewMode(newViewMode);
        setCurrentPath(undefined);
        setPathHistory([]);
        updateSearchParams({
            viewMode: newViewMode,
            pathHistory: []
        });
        // Keep the same selected test when toggling view mode
        if (selectedTestId) {
            navigate(`/launches/${launchId}/tests/${selectedTestId}`);
        } else {
            navigate(`/launches/${launchId}`);
        }
    }, [viewMode, navigate, launchId, selectedTestId]);

    const navigateToLevel = useCallback(
        (index: number) => {
            const newHistory = pathHistory.slice(0, index + 1);
            setPathHistory(newHistory);
            setCurrentPath(
                newHistory.length > 0 ? newHistory[newHistory.length - 1].id : undefined
            );
            updateSearchParams({ pathHistory: newHistory });
            // Keep the same selected test when navigating to level
            if (selectedTestId) {
                navigate(`/launches/${launchId}/tests/${selectedTestId}`);
            } else {
                navigate(`/launches/${launchId}`);
            }
        },
        [pathHistory, navigate, launchId, selectedTestId]
    );

    const toggleGroup = useCallback(
        async (groupId: number) => {
            const isExpanded = expandedGroups.has(groupId);

            if (isExpanded) {
                // Collapse group
                setExpandedGroups(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(groupId);
                    updateSearchParams({ expandedGroups: Array.from(newSet) });
                    return newSet;
                });
            } else {
                // Expand group
                setExpandedGroups(prev => {
                    const newSet = new Set(prev).add(groupId);
                    updateSearchParams({ expandedGroups: Array.from(newSet) });
                    return newSet;
                });

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
                            updateSearchParams({ expandedGroups: Array.from(newSet) });
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

    const hasGroupBeenLoaded = useCallback(
        (groupId: number) => {
            return groupContents.has(groupId);
        },
        [groupContents]
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
        isGroupLoading,
        hasGroupBeenLoaded
    };
}
