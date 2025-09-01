import './TestCaseDetails.scss';
import { useQuery } from '../../../hooks/useQuery';
import { OPERATION_TYPE, type TestResultWithCustomFields } from '../../../models';
import { AllureService } from '../../../services/allure.service';
import { useAllureApi } from '../../../hooks/useAllureApi';
import { SendTransactionOperation } from './Operations/SendTransactionOperation/SendTransactionOperation';
import { TestCaseStates } from './TestCaseStates';
import type { JSX } from 'react';
import { SignDataOperation } from './Operations/SignDataOperation/SignDataOperation';

type Props = {
    testId: number | null;
    onTestCasesRefresh?: () => void;
    onTestIdChange?: (newTestId: number) => void;
};

export function TestCaseDetails({ testId, onTestCasesRefresh, onTestIdChange }: Props) {
    const api = useAllureApi();
    const {
        loading,
        result: testResult,
        refetch: refetchTestResult
    } = useQuery<TestResultWithCustomFields | undefined>(
        signal =>
            testId
                ? AllureService.from(api, signal).getWithCustomFields(testId)
                : Promise.resolve(undefined),
        {
            deps: [api, testId]
        }
    );

    const stateComponent = TestCaseStates({
        testId,
        loading,
        hasResult: !!testResult
    });

    if (stateComponent) {
        return stateComponent;
    }

    if (!testResult) {
        return null;
    }

    let component: JSX.Element;
    switch (testResult.customFields.operationType) {
        case OPERATION_TYPE.SEND_TRANSACTION: {
            component = (
                <SendTransactionOperation
                    testResult={testResult}
                    refetchTestResult={refetchTestResult}
                    onTestCasesRefresh={onTestCasesRefresh}
                    onTestIdChange={onTestIdChange}
                />
            );
            break;
        }
        case OPERATION_TYPE.SIGN_DATA: {
            component = (
                <SignDataOperation
                    testResult={testResult}
                    refetchTestResult={refetchTestResult}
                    onTestCasesRefresh={onTestCasesRefresh}
                    onTestIdChange={onTestIdChange}
                />
            );
            break;
        }
        default: {
            // TODO:
            component = (
                <SendTransactionOperation
                    testResult={testResult}
                    refetchTestResult={refetchTestResult}
                    onTestCasesRefresh={onTestCasesRefresh}
                    onTestIdChange={onTestIdChange}
                />
            );
        }
    }

    return component;
}
