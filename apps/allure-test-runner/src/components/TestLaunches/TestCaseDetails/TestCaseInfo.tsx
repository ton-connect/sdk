import { type PropsWithChildren } from 'react';
import type { TestResultWithCustomFields } from '../../../models';
import { TestCaseHeader } from './TestCaseHeader';
import { TestCaseExpandableSection } from './TestCaseExpandableSection';
import { TestSteps } from './TestSteps';

type TestCaseInfoProps = PropsWithChildren<{
    testResult: TestResultWithCustomFields;
}>;

export function TestCaseInfo({ testResult, children }: TestCaseInfoProps) {
    return (
        <div className="p-4 w-full min-w-0 overflow-hidden space-y-4">
            <TestCaseHeader
                name={testResult.name}
                status={testResult.status}
                message={testResult.message}
            />

            <TestCaseExpandableSection
                title="Description"
                data={testResult.description}
                dataHtml={testResult.descriptionHtml}
            />

            <TestCaseExpandableSection
                title="Precondition"
                data={testResult.precondition}
                dataHtml={testResult.preconditionHtml}
            />

            <TestSteps testResult={testResult} />

            <TestCaseExpandableSection
                title="Expected Result"
                data={testResult.expectedResult}
                dataHtml={testResult.expectedResultHtml}
            />

            {children}
        </div>
    );
}
