import { useNavigate } from 'react-router-dom';
import { LaunchesList } from '../components/TestLaunches/LaunchesList/LaunchesList';
import { SearchBar } from '../components/TestLaunches/SearchBar/SearchBar';
import { useLaunches } from '../components/TestLaunches/hooks';
import '../components/TestLaunches/TestLaunches.scss';

export function LaunchesPage() {
    const navigate = useNavigate();

    const {
        search,
        launches,
        loading,
        error,
        completeError,
        complete,
        handleSearchChange,
        handleRefresh,
        clearCompleteError,
        refetch
    } = useLaunches();

    const openLaunch = (id: number) => {
        navigate(`/launches/${id}`);
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
            <div className="test-runs__section">
                <div className="test-runs__section-header">
                    <h2 className="test-runs__section-title">Launches (Project 1)</h2>
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
                            onClick={clearCompleteError}
                            className="test-runs__complete-error-close"
                        >
                            ✕
                        </button>
                    </div>
                )}

                <LaunchesList
                    launches={launches}
                    selectedLaunchId={null}
                    onOpen={openLaunch}
                    onComplete={complete}
                />
            </div>
        </div>
    );
}
