import { SearchBar } from '../SearchBar/SearchBar';
import { TestCaseDetails } from '../TestCaseDetails';
import { StatusLabel } from '../StatusLabel/StatusLabel';

import { TreeNavigation } from '../TreeNavigation';
import { Loader } from '../Loader';
import { ExpandableGroup } from '../ExpandableGroup';
import { useTestCases, useResize } from './hooks';
import type { TestCaseGroup, TestCaseItem } from '../../../models';

type Props = {
    launchId: number;
    onClose: () => void;
    onComplete?: (id: number) => void;
    launchClosed?: boolean;
};

export function TestCasesSection({ launchId, onClose, onComplete, launchClosed = false }: Props) {
    const {
        search,
        content,
        selectedTestId,
        loading,
        error,
        viewMode,
        pathHistory,
        handleRefresh,
        handleSearchChange,
        openTest,
        refreshTestCases,

        goBack,
        goToRoot,
        toggleViewMode,
        navigateToLevel,
        toggleGroup,
        isGroupExpanded,
        getGroupContents,
        isGroupLoading,
        hasGroupBeenLoaded
    } = useTestCases(launchId);

    const { isResizing, listWidth, detailsWidth, layoutRef, handleMouseDown } = useResize();

    return (
        <div className="test-runs__section">
            <div className="test-runs__section-header">
                <div className="test-runs__section-header-left">
                    <button onClick={onClose} className="btn btn-back">
                        ← Back to Launches
                    </button>
                </div>
                <h3 className="test-runs__section-title">Test Cases in Launch #{launchId}</h3>
                <div className="test-runs__section-header-right">
                    <button
                        onClick={toggleViewMode}
                        className={`btn ${viewMode === 'tree' ? 'btn-primary' : 'btn-secondary'}`}
                        title={`Switch to ${viewMode === 'tree' ? 'flat' : 'tree'} view`}
                    >
                        {viewMode === 'tree' ? 'Tree View' : 'Flat View'}
                    </button>
                    {!launchClosed && onComplete && (
                        <button onClick={() => onComplete(launchId)} className="btn btn-success">
                            Complete Launch
                        </button>
                    )}
                </div>
            </div>

            <div className="test-runs__section-header">
                <SearchBar
                    value={search}
                    onChange={handleSearchChange}
                    loading={loading}
                    onRefresh={handleRefresh}
                />
            </div>

            {viewMode === 'tree' && (
                <TreeNavigation
                    pathHistory={pathHistory}
                    onGoToRoot={goToRoot}
                    onGoBack={goBack}
                    onNavigateTo={navigateToLevel}
                    loading={loading}
                />
            )}

            {error ? (
                <div className="test-runs__error">Failed to load test cases</div>
            ) : loading && content.length === 0 ? (
                <Loader size="large" text="Loading test cases..." />
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
                        {content.map(item => {
                            if (item.type === 'GROUP') {
                                const group = item as TestCaseGroup;
                                return (
                                    <ExpandableGroup
                                        key={group.id}
                                        group={group}
                                        isExpanded={isGroupExpanded(group.id)}
                                        contents={getGroupContents(group.id)}
                                        onToggle={toggleGroup}
                                        onTestSelect={openTest}
                                        selectedTestId={selectedTestId}
                                        loading={isGroupLoading(group.id)}
                                        hasBeenLoaded={hasGroupBeenLoaded(group.id)}
                                    />
                                );
                            } else {
                                const testCase = item as TestCaseItem;
                                return (
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
                                );
                            }
                        })}
                    </div>

                    <div className="test-case-details-container">
                        <TestCaseDetails
                            testId={selectedTestId}
                            onTestCasesRefresh={refreshTestCases}
                            onTestIdChange={openTest}
                        />
                    </div>

                    <div className="resize-handle" onMouseDown={handleMouseDown} />
                </div>
            )}
        </div>
    );
}
