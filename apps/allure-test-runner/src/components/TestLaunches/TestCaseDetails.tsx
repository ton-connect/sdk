import { useMemo } from 'react';
import type { TestResult } from '../../models';
import { useAllureApi } from '../../hooks/useAllureApi';
import { useQuery } from '../../hooks/useQuery';
import { tryParseJson } from '../../utils/parse-json';
import './TestCaseDetails.scss';

type Props = {
    testId: number | null;
};

export function TestCaseDetails({ testId }: Props) {
    const client = useAllureApi();

    const { loading, result } = useQuery<TestResult | undefined>(
        signal => (testId ? client.getTestResult(testId, signal) : Promise.resolve(undefined)),
        { deps: [client, testId] }
    );

    const parsedPre = useMemo(() => tryParseJson(result?.precondition), [result]);
    const parsedExpected = useMemo(() => tryParseJson(result?.expectedResult), [result]);

    if (!testId) {
        return <div className="test-runs__empty">Select a test to view details</div>;
    }

    if (loading && !result) {
        return <div className="test-runs__loading">Loading details...</div>;
    }

    if (!result) {
        return <div className="test-runs__empty">No details</div>;
    }

    return (
        <div>
            <div className="test-runs__section-title" style={{ fontSize: '1rem' }}>
                Precondition
            </div>
            <div className="json-block">{parsedPre ? JSON.stringify(parsedPre, null, 2) : '—'}</div>
            <div className="test-runs__section-title" style={{ fontSize: '1rem', marginTop: 12 }}>
                Expected result
            </div>
            <div className="json-block">
                {parsedExpected ? JSON.stringify(parsedExpected, null, 2) : '—'}
            </div>
        </div>
    );
}
