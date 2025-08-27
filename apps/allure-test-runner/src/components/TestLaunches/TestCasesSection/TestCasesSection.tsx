import { SearchBar } from '../SearchBar/SearchBar';
import { TestCaseDetails } from '../TestCaseDetails';
import { StatusLabel } from '../StatusLabel/StatusLabel';
import { useTestCases, useResize } from './hooks';

type Props = {
    launchId: number;
    onClose: () => void;
};

export function TestCasesSection({ launchId, onClose }: Props) {
    const {
        search,
        content,
        selectedTestId,
        loading,
        error,
        handleRefresh,
        handleSearchChange,
        openTest,
        refreshTestCases
    } = useTestCases(launchId);

    const { isResizing, listWidth, detailsWidth, layoutRef, handleMouseDown } = useResize();

    return (
        <div className="test-runs__section">
            <div className="test-runs__section-header">
                <h3 className="test-runs__section-title">Test Cases in Launch #{launchId}</h3>
                <button onClick={onClose} className="btn btn-secondary">
                    Close
                </button>
            </div>

            <div className="test-runs__section-header">
                <SearchBar
                    value={search}
                    onChange={handleSearchChange}
                    loading={loading}
                    onRefresh={handleRefresh}
                />
            </div>

            {error ? (
                <div className="test-runs__error">Failed to load test cases</div>
            ) : loading && content.length === 0 ? (
                <div className="test-runs__loading">Loading test cases...</div>
            ) : content.length === 0 ? (
                <div className="test-runs__empty">No test cases found</div>
            ) : (
                <div
                    className={`test-cases-layout ${isResizing ? 'resizing' : ''}`}
                    ref={layoutRef}
                    style={
                        {
                            '--list-width': listWidth,
                            '--details-width': detailsWidth
                        } as React.CSSProperties
                    }
                >
                    <div className="test-cases-list">
                        {content.map(testCase => (
                            <div
                                key={testCase.id}
                                className={`test-case-item ${selectedTestId === testCase.id ? 'test-case-item--selected' : ''}`}
                                onClick={() => openTest(testCase.id)}
                            >
                                <div className="test-case-title">{testCase.name}</div>
                                <div className="test-case-status">
                                    <StatusLabel status={testCase.status} />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="test-case-details-container">
                        <TestCaseDetails
                            testId={selectedTestId}
                            onTestCasesRefresh={refreshTestCases}
                        />
                    </div>

                    <div className="resize-handle" onMouseDown={handleMouseDown} />
                </div>
            )}
        </div>
    );
}
