import { Title } from '../../ui/typography';
import { TestCaseExpandableSection } from './TestCaseExpandableSection';

type Props = {
    name: string;
    status?: 'unknown' | 'passed' | 'failed';
    message?: string;
};

export function TestCaseHeader({ name, status, message }: Props) {
    const getStatusText = (status?: 'unknown' | 'passed' | 'failed') => {
        switch (status) {
            case 'passed':
                return 'Passed';
            case 'failed':
                return 'Failed';
            case 'unknown':
                return 'Unknown';
            default:
                return 'In Progress';
        }
    };

    const getStatusStyles = (status?: 'unknown' | 'passed' | 'failed') => {
        switch (status) {
            case 'passed':
                return 'text-green-400 bg-green-950/30 border border-green-800/40 px-2 py-1 rounded-md text-xs font-medium';
            case 'failed':
                return 'text-red-400 bg-red-950/30 border border-red-800/40 px-2 py-1 rounded-md text-xs font-medium';
            case 'unknown':
                return 'text-yellow-400 bg-yellow-950/30 border border-yellow-800/40 px-2 py-1 rounded-md text-xs font-medium';
            default:
                return 'text-blue-400 bg-blue-950/30 border border-blue-800/40 px-2 py-1 rounded-md text-xs font-medium';
        }
    };

    return (
        <div className="space-y-3">
            {/* Simple title with status - like launch cards */}
            <div className="flex items-start justify-between gap-4">
                <Title className="font-medium text-lg leading-tight flex-1 min-w-0">{name}</Title>
                <div className="flex items-center flex-shrink-0">
                    <span className={getStatusStyles(status)}>
                        {getStatusText(status)}
                    </span>
                </div>
            </div>

            {message && (
                <TestCaseExpandableSection
                    title="Error Details"
                    data={message}
                    variant="error"
                />
            )}
        </div>
    );
}
