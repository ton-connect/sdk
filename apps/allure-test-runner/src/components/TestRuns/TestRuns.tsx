import { useEffect, useMemo, useState, useCallback } from 'react';
import { AllureApiClient } from '../../api/allure.api';
import { DEFAULT_PROJECT_ID } from '../../constants';
import type { Launch, TestCase } from '../../types';
import { LaunchCard } from '../LaunchCard';
import { TestCaseCard } from '../TestCaseCard';
import './TestRuns.scss';

type Props = {
    jwtToken: string;
};

export function TestRuns({ jwtToken }: Props) {
    const client = useMemo(() => new AllureApiClient({ jwtToken }), [jwtToken]);
    const [runs, setRuns] = useState<Launch[]>([]);
    const [loading, setLoading] = useState(false);
    const [searchLoading, setSearchLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [search, setSearch] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedLaunchId, setSelectedLaunchId] = useState<number | null>(null);
    const [testCases, setTestCases] = useState<TestCase[]>([]);

    const load = useCallback(
        async (searchTerm?: string) => {
            try {
                setLoading(true);
                setError(null);
                const data = await client.getLaunches({
                    projectId: DEFAULT_PROJECT_ID,
                    search: searchTerm || searchQuery
                });
                const content = Array.isArray(data?.content) ? data.content : [];
                setRuns(content);
            } catch (e: unknown) {
                const errorMessage = e instanceof Error ? e.message : 'Failed to load';
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        },
        [client, searchQuery]
    );

    const searchLaunches = useCallback(async () => {
        if (search.trim() === searchQuery.trim()) return;

        try {
            setSearchLoading(true);
            setError(null);
            const data = await client.getLaunches({
                projectId: DEFAULT_PROJECT_ID,
                search: search.trim()
            });

            const content = Array.isArray(data?.content) ? data.content : [];
            setRuns(content);
            setSearchQuery(search.trim());
        } catch (e: unknown) {
            const errorMessage = e instanceof Error ? e.message : 'Search failed';
            setError(errorMessage);
        } finally {
            setSearchLoading(false);
        }
    }, [client, search, searchQuery]);

    useEffect(() => {
        load();
    }, [jwtToken]);

    useEffect(() => {
        if (search.trim() !== searchQuery.trim()) {
            searchLaunches();
        }
    }, [search, searchLaunches, searchQuery]);

    const complete = async (id: number) => {
        try {
            await client.completeLaunch(id);
            await load();
        } catch (e: unknown) {
            const errorMessage = e instanceof Error ? e.message : 'Failed to complete launch';
            setError(errorMessage);
        }
    };

    const openLaunch = async (id: number) => {
        setSelectedLaunchId(id);
        try {
            setLoading(true);
            const data = await client.getLaunchItems({
                launchId: id
            });
            setTestCases(Array.isArray(data?.content) ? data.content : []);
        } catch (e: unknown) {
            const errorMessage = e instanceof Error ? e.message : 'Failed to load items';
            setError(errorMessage);
        } finally {
            setLoading(false);
        }
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
    };

    const handleRefresh = () => {
        setSearch('');
        setSearchQuery('');
        load('');
    };

    if (loading && runs.length === 0) {
        return (
            <div className="test-runs__loading">
                <div className="text-lg">Loading...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="test-runs__error">
                <div className="test-runs__error-title">Error</div>
                <div className="test-runs__error-message">{error}</div>
                <button onClick={() => load()} className="btn btn-secondary">
                    Try Again
                </button>
            </div>
        );
    }

    return (
        <div className="test-runs">
            {/* Header with search and refresh */}
            <div className="test-runs__section">
                <div className="test-runs__section-header">
                    <h2 className="test-runs__section-title">
                        Launches (Project {DEFAULT_PROJECT_ID})
                    </h2>
                    <div className="test-runs__controls">
                        <div className="test-runs__search-container">
                            <input
                                placeholder="Search launches..."
                                value={search}
                                onChange={handleSearchChange}
                                className="test-runs__search"
                                disabled={searchLoading}
                            />
                            {searchLoading && <div className="test-runs__search-spinner">🔍</div>}
                        </div>
                        <button onClick={handleRefresh} className="btn btn-secondary">
                            Refresh
                        </button>
                    </div>
                </div>

                {runs.length === 0 ? (
                    <div className="test-runs__empty">
                        {searchQuery
                            ? `No launches found for "${searchQuery}"`
                            : 'No launches found'}
                    </div>
                ) : (
                    <div className="test-runs__grid test-runs__grid--launches">
                        {runs.map(launch => (
                            <LaunchCard
                                key={launch.id}
                                launch={launch}
                                onOpen={openLaunch}
                                onComplete={complete}
                                isSelected={selectedLaunchId === launch.id}
                            />
                        ))}
                    </div>
                )}
            </div>

            {selectedLaunchId && (
                <div className="test-runs__section">
                    <div className="test-runs__section-header">
                        <h3 className="test-runs__section-title">
                            Test Cases in Launch #{selectedLaunchId}
                        </h3>
                        <button
                            onClick={() => setSelectedLaunchId(null)}
                            className="btn btn-secondary"
                        >
                            Close
                        </button>
                    </div>

                    {loading ? (
                        <div className="test-runs__loading">Loading test cases...</div>
                    ) : testCases.length === 0 ? (
                        <div className="test-runs__empty">No test cases found</div>
                    ) : (
                        <div className="test-runs__grid test-runs__grid--test-cases">
                            {testCases.map(testCase => (
                                <TestCaseCard key={testCase.id} testCase={testCase} />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
