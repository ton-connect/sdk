// import { useTransactionValidation } from '../../hooks/useTransactionValidation';
// import { SendTransactionResult } from './SendTransactionResult';
// import { SendTransactionAction } from './SendTransactionActions';
// import { useTestCaseDetails } from '../../hooks';
// import { TestCaseStates } from '../../TestCaseStates.tsx';
// import { TestCaseInfo } from '../../TestCaseInfo.tsx';
// import { TestCaseActions } from '../../TestCaseActions.tsx';
// import { FailModal } from '../../FailModal.tsx';
//
// type SendTransactionOperationProps = {
//     testResult: TestResultWithCustomFields;
// };
//
// export function SendTransactionOperation({ testResult }: ) {
//     const {
//         testResult,
//         loading,
//         isSwitching,
//         isResolving,
//         isFailing,
//         handleResolve,
//         handleFail,
//         handleRerun,
//         validationErrors,
//         setValidationErrors,
//         showFailModal,
//         setShowFailModal
//     } = useTestCaseDetails(testId, onTestCasesRefresh, onTestIdChange);
//
//     const {
//         isResultValid,
//         transactionResult,
//         handleSendTransaction,
//         isSending,
//         sendTransactionParams
//     } = useTransactionValidation({
//         testResult,
//         setValidationErrors,
//         setShowFailModal,
//         handleResolve
//     });
//
//     const stateComponent = TestCaseStates({
//         testId,
//         isSwitching,
//         loading,
//         hasResult: !!testResult
//     });
//     if (stateComponent) {
//         return stateComponent;
//     }
//
//     if (!testResult) {
//         return null;
//     }
//
//     return (
//         <div className="test-case-details">
//             <TestCaseInfo testResult={testResult}>
//                 <SendTransactionResult
//                     transactionResult={transactionResult}
//                     isResultValid={isResultValid}
//                     validationErrors={validationErrors}
//                 />
//             </TestCaseInfo>
//             <TestCaseActions
//                 testResult={testResult}
//                 isResolving={isResolving}
//                 isFailing={isResolving}
//                 onResolve={handleResolve}
//                 onFail={handleFail}
//                 onRerun={handleRerun}
//             >
//                 <SendTransactionAction
//                     isSending={isSending}
//                     sendTransactionParams={sendTransactionParams}
//                     onSendTransaction={handleSendTransaction}
//                 />
//             </TestCaseActions>
//
//             <FailModal
//                 isOpen={showFailModal}
//                 onClose={() => setShowFailModal(false)}
//                 onSubmit={handleFail}
//                 isSubmitting={isFailing}
//                 initialMessage={validationErrors.join('\n')}
//             />
//         </div>
//     );
// }
