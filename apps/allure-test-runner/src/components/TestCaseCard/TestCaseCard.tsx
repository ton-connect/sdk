import type { TestCase } from '../../types';
import './TestCaseCard.scss';

interface TestCaseCardProps {
    testCase: TestCase;
}

const getStatusColor = (status?: string) => {
    if (!status) return 'status-warning';

    switch (status.toLowerCase()) {
        case 'passed':
        case 'success':
            return 'status-success';
        case 'failed':
        case 'failure':
            return 'status-error';
        case 'skipped':
            return 'status-info';
        default:
            return 'status-warning';
    }
};

export function TestCaseCard({ testCase }: TestCaseCardProps) {
    return (
        <div className="test-case-card">
            <div className="test-case-card__header">
                <span className={`status-badge ${getStatusColor(testCase.status)}`}>
                    {testCase.status || 'Unknown'}
                </span>
                {testCase.testCaseId && (
                    <span className="test-case-card__id">#{testCase.testCaseId}</span>
                )}
            </div>

            <h3 className="test-case-card__title">{testCase.name}</h3>

            {testCase.description && (
                <p className="test-case-card__description">{testCase.description}</p>
            )}

            {testCase.tags && testCase.tags.length > 0 && (
                <div className="test-case-card__tags">
                    {testCase.tags.map((tag, index) => (
                        <span key={index} className="test-case-card__tag">
                            {tag}
                        </span>
                    ))}
                </div>
            )}
        </div>
    );
}
