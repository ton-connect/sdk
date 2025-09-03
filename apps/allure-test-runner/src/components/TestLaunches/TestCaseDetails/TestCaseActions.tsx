import { type PropsWithChildren, useState } from 'react';
import { FailModal } from './FailModal';
import type { TestResult } from '../../../models';

type Props = PropsWithChildren<{
    testResult: TestResult | undefined;

    isResolving: boolean;
    isFailing: boolean;

    onResolve: () => void;
    onFail: (message: string) => void;
    onRerun: () => void;
}>;

export function TestCaseActions({
    children,
    testResult,
    isResolving,
    isFailing,
    onResolve,
    onFail,
    onRerun
}: Props) {
    const [isFailModalOpen, setIsFailModalOpen] = useState(false);

    const handleFailSubmit = (message: string) => {
        onFail(message);
        setIsFailModalOpen(false);
    };

    const isStatusFinal = testResult?.status === 'passed' || testResult?.status === 'failed';

    return (
        <>
            <div className="test-case-details__actions">
                {children ?? null}
                {!isStatusFinal && (
                    <>
                        <button
                            onClick={onResolve}
                            disabled={isResolving || !testResult}
                            className="btn btn-success"
                            style={{ marginLeft: 4 }}
                        >
                            {isResolving ? 'Resolving…' : 'Passed'}
                        </button>

                        <button
                            onClick={() => setIsFailModalOpen(true)}
                            disabled={isFailing || !testResult}
                            className="btn btn-danger"
                            style={{ marginLeft: 4 }}
                        >
                            {isFailing ? 'Marking as Failed...' : 'Failed'}
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

            <FailModal
                isOpen={isFailModalOpen}
                onClose={() => setIsFailModalOpen(false)}
                onSubmit={handleFailSubmit}
                isSubmitting={isFailing}
            />
        </>
    );
}
