import { ClipboardList, X, Loader2 } from 'lucide-react';
import { Body } from '../../ui/typography';

type Props = {
    testId: number | null;
    loading: boolean;
    hasResult: boolean;
};

export function TestCaseStates({ testId, loading, hasResult }: Props) {
    if (!testId) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8">
                <div className="flex flex-col items-center text-center space-y-4">
                    <ClipboardList className="h-16 w-16 text-muted-foreground/40" />
                    <Body className="text-muted-foreground text-lg">
                        Select a test to view details
                    </Body>
                </div>
            </div>
        );
    }

    if (loading && !hasResult) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8">
                <div className="flex flex-col items-center text-center space-y-4">
                    <Loader2 className="h-12 w-12 text-muted-foreground animate-spin" />
                    <Body className="text-muted-foreground text-lg">Loading test details...</Body>
                </div>
            </div>
        );
    }

    if (!hasResult) {
        return (
            <div className="flex-1 flex flex-col items-center justify-center p-8">
                <div className="flex flex-col items-center text-center space-y-4">
                    <X className="h-16 w-16 text-muted-foreground/40" />
                    <Body className="text-muted-foreground text-lg">No details available</Body>
                </div>
            </div>
        );
    }

    return null;
}
