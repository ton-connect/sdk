import './TestCaseDetails.scss';
import { OPERATION_TYPE, type TestResultWithCustomFields } from '../../../models';
import { useGetTestResultWithCustomFieldsQuery } from '../../../store/api/allureApi';
import { SendTransactionOperation } from './Operations/SendTransactionOperation/SendTransactionOperation';
import { TestCaseStates } from './TestCaseStates';
import type { JSX } from 'react';
import { SignDataOperation } from './Operations/SignDataOperation/SignDataOperation';
import { ConnectOperation } from './Operations/ConnectOperation/ConnectOperation';
import { DefaultTestCaseOperation } from './Operations/DefaultTestCaseOperation/DefaultTestCaseOperation';

type Props = {
    testId: number | null;
    onTestCasesRefresh?: () => void;
    onTestIdChange?: (newTestId: number) => void;
};

export function TestCaseDetails({ testId, onTestCasesRefresh, onTestIdChange }: Props) {
    const {
        data: testResult,
        isLoading: loading,
        refetch
    } = useGetTestResultWithCustomFieldsQuery({ id: testId ?? -1 }, { skip: !testId });

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

    const refetchTestResult = () => refetch();

    let component: JSX.Element;
    switch (testResult.customFields.operationType as keyof typeof OPERATION_TYPE) {
        case OPERATION_TYPE.SEND_TRANSACTION: {
            component = (
                <SendTransactionOperation
                    key={testResult.id}
                    testResult={testResult as TestResultWithCustomFields}
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
                    key={testResult.id}
                    testResult={testResult as TestResultWithCustomFields}
                    refetchTestResult={refetchTestResult}
                    onTestCasesRefresh={onTestCasesRefresh}
                    onTestIdChange={onTestIdChange}
                />
            );
            break;
        }
        case OPERATION_TYPE.CONNECT: {
            component = (
                <ConnectOperation
                    key={testResult.id}
                    testResult={testResult as TestResultWithCustomFields}
                    refetchTestResult={refetchTestResult}
                    onTestCasesRefresh={onTestCasesRefresh}
                    onTestIdChange={onTestIdChange}
                />
            );
            break;
        }
        default: {
            component = (
                <DefaultTestCaseOperation
                    key={testResult.id}
                    testResult={testResult as TestResultWithCustomFields}
                    refetchTestResult={refetchTestResult}
                    onTestCasesRefresh={onTestCasesRefresh}
                    onTestIdChange={onTestIdChange}
                />
            );
        }
    }

    return component;
}
