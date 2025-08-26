import { useState } from 'react';
import { DEFAULT_PROJECT_ID } from '../../constants';
import { LaunchesList } from './LaunchesList';
import { SearchBar } from './SearchBar';
import { TestCasesSection } from './TestCasesSection';
import './TestLaunches.scss';
import { useQuery } from '../../hooks/useQuery';
import { useDebounce } from '../../hooks/useDebounce';
import { useAllureApi } from '../../hooks/useAllureApi';

// TODO: fix search so it not reloads every frame y.mileyka
export function TestLaunches() {
    const client = useAllureApi();
    const [search, setSearch] = useState('');
    const searchQuery = useDebounce(search.trim(), 300);

    const [selectedLaunchId, setSelectedLaunchId] = useState<number | null>(null);

    const { loading, error, refetch, result } = useQuery(
        signal =>
            client.getLaunches({ projectId: DEFAULT_PROJECT_ID, search: searchQuery }, signal),
        { deps: [client, searchQuery] }
    );
    const launches = result?.content ?? [];

    const complete = async (id: number) => {
        // TODO: deal with error
        await client.completeLaunch(id).catch(console.error);
        refetch();
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

    if (loading && launches.length === 0) {
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
                <div className="test-runs__error-message">{String(error)}</div>
                <button onClick={() => refetch()} className="btn btn-secondary">
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

                {launches.length === 0 ? (
                    <div className="test-runs__empty">
                        {searchQuery
                            ? `No launches found for "${searchQuery}"`
                            : 'No launches found'}
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
