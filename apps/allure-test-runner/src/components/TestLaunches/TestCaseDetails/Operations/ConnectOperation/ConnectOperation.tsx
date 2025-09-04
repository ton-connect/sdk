import { ConnectResult } from './ConnectResult';
import { useTestCaseDetails } from '../../hooks';
import { TestCaseInfo } from '../../TestCaseInfo';
import { TestCaseActions } from '../../TestCaseActions';
import { StatusModal } from '../../StatusModal/StatusModal';
import type { TestResultWithCustomFields } from '../../../../../models';
import { useConnectValidation } from './hooks/useConnectValidation';
import { ConnectActions } from './ConnectActions';

type ConnectOperationProps = {
    testResult: TestResultWithCustomFields;
    refetchTestResult?: () => void;
    onTestCasesRefresh?: () => void;
    onTestIdChange?: (newTestId: number) => void;
};

export function ConnectOperation({
    testResult,
    refetchTestResult,
    onTestCasesRefresh,
    onTestIdChange
}: ConnectOperationProps) {
    const {
        isResolving,
        isFailing,
        handleResolve,
        handleFail,
        handleRerun,
        validationErrors,
        setValidationErrors,
        showStatusModal,
        statusModalInitialStatus,
        statusModalMessage,
        showValidationModal,
        handleStatusModalSubmit,
        setShowStatusModal
    } = useTestCaseDetails(testResult, refetchTestResult, onTestCasesRefresh, onTestIdChange);

    const { isResultValid, connectResult, isConnecting, handleConnect, handleAbort, wallet } =
        useConnectValidation({
            testResult,
            setValidationErrors,
            showValidationModal,
            setShowStatusModal
        });

    if (!testResult) {
        return null;
    }

    const walletAddress = wallet?.account?.address
        ? `${wallet.account.address.slice(0, 4)}...${wallet.account.address.slice(-4)}`
        : undefined;

    return (
        <div className="test-case-details">
            <TestCaseInfo testResult={testResult}>
                <ConnectResult
                    connectResult={connectResult}
                    isResultValid={isResultValid}
                    validationErrors={validationErrors}
                    walletAddress={walletAddress}
                />
            </TestCaseInfo>
            <TestCaseActions
                testResult={testResult}
                isResolving={isResolving}
                isFailing={isFailing}
                onResolve={handleResolve}
                onFail={handleFail}
                onRerun={handleRerun}
                disableInternalModal={true}
            >
                <ConnectActions
                    onConnect={handleConnect}
                    onAbort={handleAbort}
                    isConnecting={isConnecting}
                />
            </TestCaseActions>

            <StatusModal
                isOpen={showStatusModal}
                onClose={() => setShowStatusModal(false)}
                onSubmit={handleStatusModalSubmit}
                initialStatus={statusModalInitialStatus}
                initialReason={statusModalMessage}
                isSubmitting={isResolving || isFailing}
            />
        </div>
    );
}
