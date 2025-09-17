import { useState, useCallback, useEffect } from 'react';
import { useSearchParams, useNavigate, useParams } from 'react-router-dom';
import type { PaginatedResponse, TestCase, TestCaseGroup } from '../../../../models';
import { useDebounce } from '../../../../hooks/useDebounce';
import {
    useGetLaunchItemsQuery,
    useGetLaunchItemsTreeQuery,
    useLazyGetLaunchItemTreeQuery
} from '../../../../store/api/allureApi';

//
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
    const navigate = useNavigate();
    const params = useParams<{ testId?: string }>();
    const [searchParams, setSearchParams] = useSearchParams();

    const urlState = parseTreeStateFromSearchParams(searchParams);

    const selectedTestIdFromUrl = params.testId ? parseInt(params.testId) : null;
    const selectedTestId =
        selectedTestIdFromUrl && !isNaN(selectedTestIdFromUrl)
            ? selectedTestIdFromUrl
            : (urlState.selectedTestId ?? null);

    const [search, setSearch] = useState('');
    const searchQuery = useDebounce(search.trim(), 300);
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
    const [parentPathByGroupId, setParentPathByGroupId] = useState<Map<number, number[]>>(
        new Map()
    );
    const [loadingGroups, setLoadingGroups] = useState<Set<number>>(new Set());

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

    const {
        data: flatData,
        isLoading: flatLoading,
        refetch: refetchFlat
    } = useGetLaunchItemsQuery({ launchId, search: searchQuery }, { skip: viewMode !== 'flat' });

    const pathChain = pathHistory.length > 0 ? pathHistory.map(p => p.id) : undefined;
    const {
        data: treeData,
        isLoading: treeLoading,
        refetch: refetchTree
    } = useGetLaunchItemsTreeQuery(
        { launchId, search: searchQuery, path: pathChain },
        { skip: viewMode !== 'tree' }
    );

    const [triggerGetLaunchItemTree] = useLazyGetLaunchItemTreeQuery();

    const loading = viewMode === 'flat' ? flatLoading : treeLoading;
    const result = (viewMode === 'flat' ? flatData : treeData) as
        | PaginatedResponse<TestCase>
        | undefined;

    const content = Array.isArray(result?.content) ? result.content : [];

    useEffect(() => {
        if (viewMode !== 'tree') return;
        const pathChain = pathHistory.length > 0 ? pathHistory.map(p => p.id) : [];
        if (Array.isArray(content) && content.length > 0) {
            setParentPathByGroupId(prev => {
                const next = new Map(prev);
                for (const item of content as TestCase[]) {
                    if ((item as TestCaseGroup).type === 'GROUP') {
                        next.set((item as TestCaseGroup).id, pathChain);
                    }
                }
                return next;
            });
        }
    }, [content, pathHistory, viewMode]);

    useEffect(() => {
        updateSearchParams({
            viewMode,
            expandedGroups: Array.from(expandedGroups),
            pathHistory
        });
    }, [viewMode, expandedGroups, pathHistory, updateSearchParams]);

    useEffect(() => {
        const loadExpandedGroups = async () => {
            for (const groupId of expandedGroups) {
                if (!groupContents.has(groupId)) {
                    const knownBasePath = parentPathByGroupId.get(groupId);
                    if (!knownBasePath) {
                        continue;
                    }
                    setLoadingGroups(prev => new Set(prev).add(groupId));
                    try {
                        const result = await triggerGetLaunchItemTree(
                            { launchId, path: [...knownBasePath, groupId] },
                            true
                        ).unwrap();
                        setGroupContents(prev => new Map(prev).set(groupId, result.content));

                        setParentPathByGroupId(prev => {
                            const next = new Map(prev);
                            for (const item of result.content as TestCase[]) {
                                if ((item as TestCaseGroup).type === 'GROUP') {
                                    next.set((item as TestCaseGroup).id, [
                                        ...knownBasePath,
                                        groupId
                                    ]);
                                }
                            }
                            return next;
                        });
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
    }, [launchId, expandedGroups, parentPathByGroupId, triggerGetLaunchItemTree, groupContents]);

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
    }, [searchParams]);

    const refetch = () => {
        if (viewMode === 'flat') refetchFlat();
        else refetchTree();
    };

    const handleRefresh = useCallback(() => {
        setSearch('');

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

        // Don't clear existing content - keep it visible during refresh
        // setGroupContents(new Map());
        // setLoadingGroups(new Set());

        refetch();

        // Refresh expanded groups in the background
        for (const groupId of currentExpandedGroups) {
            const basePath = parentPathByGroupId.get(groupId) ?? pathHistory.map(p => p.id);
            if (!basePath) continue;
            try {
                const result = await triggerGetLaunchItemTree(
                    { launchId, path: [...basePath, groupId] },
                    true
                ).unwrap();
                setGroupContents(prev => new Map(prev).set(groupId, result.content));

                setParentPathByGroupId(prev => {
                    const next = new Map(prev);
                    for (const item of result.content as TestCase[]) {
                        if ((item as TestCaseGroup).type === 'GROUP') {
                            next.set((item as TestCaseGroup).id, [...basePath, groupId]);
                        }
                    }
                    return next;
                });
            } catch (error) {
                console.error(`Failed to reload group ${groupId}:`, error);
            }
        }
    }, [
        refetch,
        expandedGroups,
        launchId,
        parentPathByGroupId,
        pathHistory,
        triggerGetLaunchItemTree
    ]);

    const openGroup = useCallback(
        (group: { id: number; name: string }) => {
            setPathHistory(prev => {
                const newHistory = [...prev, group];
                updateSearchParams({ pathHistory: newHistory });
                return newHistory;
            });
            setCurrentPath(group.id);

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
                setExpandedGroups(prev => {
                    const newSet = new Set(prev);
                    newSet.delete(groupId);
                    updateSearchParams({ expandedGroups: Array.from(newSet) });
                    return newSet;
                });
            } else {
                setExpandedGroups(prev => {
                    const newSet = new Set(prev).add(groupId);
                    updateSearchParams({ expandedGroups: Array.from(newSet) });
                    return newSet;
                });

                if (!groupContents.has(groupId)) {
                    setLoadingGroups(prev => new Set(prev).add(groupId));

                    try {
                        const basePath =
                            parentPathByGroupId.get(groupId) ?? pathHistory.map(p => p.id);
                        const result = await triggerGetLaunchItemTree(
                            { launchId, path: [...basePath, groupId] },
                            true
                        ).unwrap();
                        setGroupContents(prev => new Map(prev).set(groupId, result.content));

                        setParentPathByGroupId(prev => {
                            const next = new Map(prev);
                            for (const item of result.content as TestCase[]) {
                                if ((item as TestCaseGroup).type === 'GROUP') {
                                    next.set((item as TestCaseGroup).id, [...basePath, groupId]);
                                }
                            }
                            return next;
                        });
                    } catch (error) {
                        console.error('Failed to load group contents:', error);

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
        [
            expandedGroups,
            groupContents,
            launchId,
            loadingGroups,
            parentPathByGroupId,
            pathHistory,
            triggerGetLaunchItemTree
        ]
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
        search,
        content,
        selectedTestId,
        loading,
        error: undefined,
        viewMode,
        currentPath,
        pathHistory,

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
