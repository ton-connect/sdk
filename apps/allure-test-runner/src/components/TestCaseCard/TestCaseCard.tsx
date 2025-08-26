import type { TestCase } from '../../models';
import './TestCaseCard.scss';

interface TestCaseCardProps {
    testCase: TestCase;
}

export function TestCaseCard({ testCase }: TestCaseCardProps) {
    return (
        <div className="test-case-card">
            <div className="test-case-card__header">
                {testCase.testCaseId && (
                    <span className="test-case-card__id">#{testCase.testCaseId}</span>
                )}
            </div>

            <h3 className="test-case-card__title">{testCase.name}</h3>
        </div>
    );
}
