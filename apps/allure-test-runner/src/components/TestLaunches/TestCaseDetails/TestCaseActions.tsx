import { type PropsWithChildren, useState } from 'react';
import { StatusModal } from './StatusModal/StatusModal';
import type { TestResult } from '../../../models';

type Props = PropsWithChildren<{
    testResult: TestResult | undefined;

    isResolving: boolean;
    isFailing: boolean;

    onResolve: (reason?: string) => void;
    onFail: (message: string) => void;
    onRerun: () => void;

    // Disable internal modal when external modal is used
    disableInternalModal?: boolean;
}>;

export function TestCaseActions({
    children,
    testResult,
    isResolving,
    isFailing,
    onResolve,
    onFail,
    onRerun,
    disableInternalModal = false
}: Props) {
    const [isStatusModalOpen, setIsStatusModalOpen] = useState(false);
    const [modalInitialStatus, setModalInitialStatus] = useState<'passed' | 'failed'>('passed');

    const handleStatusButtonClick = (status: 'passed' | 'failed') => {
        setModalInitialStatus(status);
        setIsStatusModalOpen(true);
    };

    const handleStatusSubmit = (status: 'passed' | 'failed', reason?: string) => {
        if (status === 'passed') {
            onResolve(reason);
        } else {
            onFail(reason || '');
        }
        setIsStatusModalOpen(false);
    };

    const isStatusFinal = testResult?.status === 'passed' || testResult?.status === 'failed';

    return (
        <>
            <div className="test-case-details__actions">
                {children ?? null}
                {!isStatusFinal && (
                    <>
                        <button
                            onClick={() => onResolve()}
                            disabled={isResolving || isFailing || !testResult}
                            className="btn btn-success"
                            style={{ marginLeft: 4 }}
                        >
                            Passed
                        </button>

                        <button
                            onClick={() =>
                                disableInternalModal
                                    ? onFail('')
                                    : handleStatusButtonClick('failed')
                            }
                            disabled={isResolving || isFailing || !testResult}
                            className="btn btn-danger"
                            style={{ marginLeft: 4 }}
                        >
                            Failed
                        </button>
                    </>
                )}

                {isStatusFinal && (
                    <button
                        onClick={onRerun}
                        disabled={!testResult}
                        className="btn btn-secondary"
                        style={{ marginLeft: 4 }}
                    >
                        Rerun
                    </button>
                )}
            </div>

            {!disableInternalModal && (
                <StatusModal
                    isOpen={isStatusModalOpen}
                    onClose={() => setIsStatusModalOpen(false)}
                    onSubmit={handleStatusSubmit}
                    initialStatus={modalInitialStatus}
                    isSubmitting={isResolving || isFailing}
                />
            )}
        </>
    );
}
