import { useState } from 'react';
import { LaunchesList } from './LaunchesList/LaunchesList';
import { SearchBar } from './SearchBar/SearchBar';
import { TestCasesSection } from './TestCasesSection/TestCasesSection';
import { useLaunches } from './hooks';
import './TestLaunches.scss';

export function TestLaunches() {
    const [selectedLaunchId, setSelectedLaunchId] = useState<number | null>(null);

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
        setSelectedLaunchId(id);
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

    // Если выбран ланч, показываем только тест-кейсы
    if (selectedLaunchId) {
        const selectedLaunch = launches.find(launch => launch.id === selectedLaunchId);

        return (
            <TestCasesSection
                launchId={selectedLaunchId}
                onClose={() => setSelectedLaunchId(null)}
                onComplete={complete}
                launchClosed={selectedLaunch?.closed}
            />
        );
    }

    // Иначе показываем список ланчей
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
                            {search.trim()
                                ? `No launches found for "${search.trim()}"`
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
        </div>
    );
}
