import { type PropsWithChildren, useState } from 'react';
import { StatusModal } from './StatusModal/StatusModal';
import type { TestResult } from '../../../models';
import {
    CheckCircle,
    XCircle,
    RotateCcw,
    MoreHorizontal,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import { Button } from '../../ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '../../ui/dropdown-menu';
import { Caption } from '../../ui/typography';

type Props = PropsWithChildren<{
    testResult: TestResult | undefined;

    isResolving: boolean;
    isFailing: boolean;

    onResolve: (reason?: string) => void;
    onFail: (message: string) => void;
    onRerun: () => void;

    // Navigation controls
    onPreviousTest?: () => void;
    onNextTest?: () => void;
    canNavigatePrevious?: boolean;
    canNavigateNext?: boolean;

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
    onPreviousTest,
    onNextTest,
    canNavigatePrevious = false,
    canNavigateNext = false,
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
            <div className="border-t bg-background">
                {/* Operation-specific actions - only show when test is not in final state (hide during rerun state) */}
                {children && !isStatusFinal && (
                    <div className="px-3 py-2 border-b border-border/50">{children}</div>
                )}

                {/* Combined navigation and test status actions */}
                <div className="px-3 py-2">
                    <div className="flex items-center justify-between">
                        {/* Navigation controls */}
                        <div className="flex items-center gap-1">
                            {(onPreviousTest || onNextTest) && (
                                <>
                                    <Button
                                        onClick={onPreviousTest}
                                        disabled={!canNavigatePrevious}
                                        variant="ghost"
                                        size="sm"
                                        className="px-2"
                                    >
                                        <ChevronLeft className="h-3 w-3" />
                                    </Button>
                                    <Button
                                        onClick={onNextTest}
                                        disabled={!canNavigateNext}
                                        variant="ghost"
                                        size="sm"
                                        className="px-2"
                                    >
                                        <ChevronRight className="h-3 w-3" />
                                    </Button>
                                </>
                            )}
                        </div>

                        {/* Test status actions with compact explanation */}
                        <div className="flex items-center gap-2">
                            {/* Compact explanation when actions are hidden */}
                            {isStatusFinal && (
                                <Caption className="text-xs text-muted-foreground">
                                    {testResult?.status === 'passed' ? 'Passed' : 'Failed'} • Rerun
                                    to modify or execute actions
                                </Caption>
                            )}

                            <div className="flex items-center gap-1">
                                {!isStatusFinal ? (
                                    <>
                                        <Button
                                            onClick={() =>
                                                disableInternalModal
                                                    ? onResolve('')
                                                    : handleStatusButtonClick('passed')
                                            }
                                            disabled={isResolving || isFailing || !testResult}
                                            size="sm"
                                            className="bg-green-600 hover:bg-green-700 text-white border-0"
                                        >
                                            <CheckCircle className="h-3 w-3 mr-1" />
                                            Pass
                                        </Button>

                                        <DropdownMenu>
                                            <DropdownMenuTrigger asChild>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    disabled={
                                                        isResolving || isFailing || !testResult
                                                    }
                                                    className="px-2"
                                                >
                                                    <MoreHorizontal className="h-3 w-3" />
                                                </Button>
                                            </DropdownMenuTrigger>
                                            <DropdownMenuContent align="end" className="w-32">
                                                <DropdownMenuItem
                                                    onClick={() =>
                                                        disableInternalModal
                                                            ? onFail('')
                                                            : handleStatusButtonClick('failed')
                                                    }
                                                    disabled={isResolving || isFailing}
                                                    className="text-red-600 focus:text-red-600"
                                                >
                                                    <XCircle className="h-3 w-3 mr-2" />
                                                    Fail
                                                </DropdownMenuItem>
                                            </DropdownMenuContent>
                                        </DropdownMenu>
                                    </>
                                ) : (
                                    <Button
                                        onClick={onRerun}
                                        disabled={!testResult}
                                        variant="outline"
                                        size="sm"
                                    >
                                        <RotateCcw className="h-3 w-3 mr-1" />
                                        Rerun
                                    </Button>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
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
