import { useState } from 'react';
import { DEFAULT_PROJECT_ID } from '../../constants';
import { LaunchesList } from './LaunchesList/LaunchesList';
import { SearchBar } from './SearchBar/SearchBar';
import { TestCasesSection } from './TestCasesSection/TestCasesSection';
import './TestLaunches.scss';
import { useQuery } from '../../hooks/useQuery';
import { useDebounce } from '../../hooks/useDebounce';
import { useAllureApi } from '../../hooks/useAllureApi';

export function TestLaunches() {
    const client = useAllureApi();
    const [search, setSearch] = useState('');
    const searchQuery = useDebounce(search.trim(), 300);

    const [selectedLaunchId, setSelectedLaunchId] = useState<number | null>(null);
    const [completeError, setCompleteError] = useState<string | null>(null);

    const { loading, error, refetch, result } = useQuery(
        signal =>
            client.getLaunches({ projectId: DEFAULT_PROJECT_ID, search: searchQuery }, signal),
        { deps: [client, searchQuery] }
    );
    const launches = result?.content ?? [];

    const complete = async (id: number) => {
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
    };

    const openLaunch = async (id: number) => {
        setSelectedLaunchId(id);
    };

    const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
    };

    const handleRefresh = () => {
        setSearch('');
        refetch();
    };

    if (error) {
        return (
            <div className="test-runs__error">
                <div className="test-runs__error-icon">⚠️</div>
                <div className="test-runs__error-title">Failed to load launches</div>
                <div className="test-runs__error-message">{String(error)}</div>
                <button onClick={() => refetch()} className="btn btn-primary">
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
                    <SearchBar
                        value={search}
                        loading={loading}
                        onChange={handleSearchChange}
                        onRefresh={handleRefresh}
                    />
                </div>

                {completeError && (
                    <div className="test-runs__complete-error">
                        <div className="test-runs__complete-error-icon">❌</div>
                        <div className="test-runs__complete-error-content">
                            <div className="test-runs__complete-error-title">
                                Failed to complete launch
                            </div>
                            <div className="test-runs__complete-error-message">{completeError}</div>
                        </div>
                        <button
                            onClick={() => setCompleteError(null)}
                            className="test-runs__complete-error-close"
                        >
                            ×
                        </button>
                    </div>
                )}

                {loading && launches.length === 0 && (
                    <div className="test-runs__loading">
                        <div className="test-runs__loading-spinner"></div>
                        <div className="test-runs__loading-text">Loading launches...</div>
                    </div>
                )}

                {launches.length === 0 ? (
                    <div className="test-runs__empty">
                        <div className="test-runs__empty-icon">📋</div>
                        <div className="test-runs__empty-text">
                            {searchQuery
                                ? `No launches found for "${searchQuery}"`
                                : 'No launches found'}
                        </div>
                    </div>
                ) : (
                    <LaunchesList
                        launches={launches}
                        selectedLaunchId={selectedLaunchId}
                        onOpen={openLaunch}
                        onComplete={complete}
                    />
                )}
            </div>

            {selectedLaunchId && (
                <TestCasesSection
                    launchId={selectedLaunchId}
                    onClose={() => setSelectedLaunchId(null)}
                />
            )}
        </div>
    );
}
