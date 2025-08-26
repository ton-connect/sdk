import { useState, useRef, useCallback, useEffect } from 'react';
import type { PaginatedResponse, TestCase } from '../../../models';
import { useAllureApi } from '../../../hooks/useAllureApi';
import { SearchBar } from '../SearchBar/SearchBar';
import { useQuery } from '../../../hooks/useQuery';
import { useDebounce } from '../../../hooks/useDebounce';
import { TestCaseDetails } from '../TestCaseDetails/TestCaseDetails';
import { StatusLabel } from '../StatusLabel/StatusLabel';

type Props = {
    launchId: number;
    onClose: () => void;
};

export function TestCasesSection({ launchId, onClose }: Props) {
    const client = useAllureApi();
    const [search, setSearch] = useState('');
    const searchQuery = useDebounce(search.trim(), 300);
    const [isResizing, setIsResizing] = useState(false);
    const [listWidth, setListWidth] = useState('40%');
    const layoutRef = useRef<HTMLDivElement>(null);

    const { loading, result, error, refetch } = useQuery<PaginatedResponse<TestCase>>(
        signal => client.getLaunchItems({ launchId, search: searchQuery }, signal),
        { deps: [client, launchId, searchQuery] }
    );

    const [selectedTestId, setSelectedTestId] = useState<number | null>(null);

    const content = Array.isArray(result?.content) ? result.content : [];

    const handleRefresh = useCallback(() => {
        setSearch('');
        setSelectedTestId(null);
        refetch();
    }, [refetch]);

    const handleMouseDown = useCallback((e: React.MouseEvent) => {
        e.preventDefault();
        setIsResizing(true);
        document.body.style.cursor = 'col-resize';
        document.body.style.userSelect = 'none';
    }, []);

    const handleMouseMove = useCallback(
        (e: MouseEvent) => {
            if (!isResizing || !layoutRef.current) return;

            const rect = layoutRef.current.getBoundingClientRect();
            const newListWidth = ((e.clientX - rect.left) / rect.width) * 100;
            const clampedWidth = Math.max(20, Math.min(80, newListWidth));
            setListWidth(`${clampedWidth}%`);
        },
        [isResizing]
    );

    const handleMouseUp = useCallback(() => {
        setIsResizing(false);
        document.body.style.cursor = '';
        document.body.style.userSelect = '';
    }, []);

    useEffect(() => {
        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
        return () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [handleMouseMove, handleMouseUp]);

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
                    onChange={e => setSearch(e.target.value)}
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
                            '--details-width': `calc(100% - ${listWidth} - 16px)`
                        } as React.CSSProperties
                    }
                >
                    <div className="test-cases-list">
                        {content.map(testCase => (
                            <div
                                key={testCase.id}
                                className={`test-case-item ${selectedTestId === testCase.id ? 'test-case-item--selected' : ''}`}
                                onClick={() => setSelectedTestId(testCase.id)}
                            >
                                <div className="test-case-title">{testCase.name}</div>
                                <div className="test-case-status">
                                    <StatusLabel status={testCase.status} />
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="test-case-details-container">
                        <TestCaseDetails testId={selectedTestId} />
                    </div>

                    <div className="resize-handle" onMouseDown={handleMouseDown} />
                </div>
            )}
        </div>
    );
}
