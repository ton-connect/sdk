import { type PropsWithChildren } from 'react';
import type { TestResultWithCustomFields } from '../../../models';
import { TestCaseHeader } from './TestCaseHeader';
import { OperationTypeField } from './OperationTypeField';
import { TestCaseDescription } from './TestCaseDescription';
import { TestCaseExpandableSection } from './TestCaseExpandableSection';
import { TestSteps } from './TestSteps';

type TestCaseInfoProps = PropsWithChildren<{
    testResult: TestResultWithCustomFields;
}>;

export function TestCaseInfo({ testResult, children }: TestCaseInfoProps) {
    return (
        <div className="test-case-details__content">
            <TestCaseHeader
                name={testResult.name}
                status={testResult.status}
                message={testResult.message}
            />
            <OperationTypeField operationType={testResult?.customFields?.operationType} />
            <TestCaseDescription
                description={testResult.description}
                descriptionHtml={testResult.descriptionHtml}
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
