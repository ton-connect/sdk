import { useState } from 'react';
import type { PaginatedResponse, TestCase } from '../../models';
import { TestCaseCard } from '../TestCaseCard';
import { useAllureApi } from '../../hooks/useAllureApi';
import { SearchBar } from './SearchBar';
import { useQuery } from '../../hooks/useQuery';
import { useDebounce } from '../../hooks/useDebounce';

type Props = {
    launchId: number;
    onClose: () => void;
};

export function TestCasesSection({ launchId, onClose }: Props) {
    const client = useAllureApi();
    const [search, setSearch] = useState('');
    const searchQuery = useDebounce(search.trim(), 300);

    const { loading, result, error } = useQuery<PaginatedResponse<TestCase>>(
        signal => client.getLaunchItems({ launchId, search: searchQuery }, signal),
        { deps: [client, launchId, searchQuery] }
    );

    const content = Array.isArray(result?.content) ? result.content : [];

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
                    onRefresh={() => {
                        setSearch('');
                    }}
                />
            </div>

            {error ? (
                <div className="test-runs__error">Failed to load test cases</div>
            ) : loading && content.length === 0 ? (
                <div className="test-runs__loading">Loading test cases...</div>
            ) : content.length === 0 ? (
                <div className="test-runs__empty">No test cases found</div>
            ) : (
                <div className="test-runs__grid test-runs__grid--test-cases">
                    {content.map(testCase => (
                        <TestCaseCard key={testCase.id} testCase={testCase} />
                    ))}
                </div>
            )}
        </div>
    );
}
