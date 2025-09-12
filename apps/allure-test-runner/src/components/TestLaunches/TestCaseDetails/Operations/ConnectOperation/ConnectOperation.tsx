import { ConnectResult } from './ConnectResult';
import { useTestCaseDetails } from '../../hooks';
import { TestCaseInfo } from '../../TestCaseInfo';
import { TestCaseActions } from '../../TestCaseActions';
import { StatusModal } from '../../StatusModal/StatusModal';
import type { TestResultWithCustomFields } from '../../../../../models';
import { useConnectValidation } from './hooks/useConnectValidation';
import { ConnectActions } from './ConnectActions';
import { toUserFriendlyAddress } from '@tonconnect/ui-react';
import { useMemo } from 'react';

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

    const walletAddress = useMemo(() => {
        let walletAddress = undefined;
        try {
            if (wallet?.account?.address) {
                walletAddress = toUserFriendlyAddress(wallet.account.address);
            }
        } catch (error) {}
        return walletAddress;
    }, [wallet]);

    return (
        <div className="h-full flex flex-col bg-background overflow-hidden">
            <div className="flex-1 overflow-y-auto overflow-x-hidden min-h-0">
                <TestCaseInfo testResult={testResult}>
                    <ConnectResult
                        connectResult={connectResult}
                        isResultValid={isResultValid}
                        validationErrors={validationErrors}
                        walletAddress={walletAddress}
                    />
                </TestCaseInfo>
            </div>

            <div className="flex-shrink-0 border-t border-border bg-background">
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
            </div>

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
