import { CheckCircle, XCircle, Clock, HelpCircle } from 'lucide-react';

type StatusLabelProps = {
    status?: 'unknown' | 'passed' | 'failed';
};

export function StatusLabel({ status }: StatusLabelProps) {
    // If status is undefined, consider it as "in progress"
    const displayStatus = status || 'in-progress';

    const getIcon = () => {
        switch (displayStatus) {
            case 'passed':
                return <CheckCircle className="h-3.5 w-3.5 text-green-600" />;
            case 'failed':
                return <XCircle className="h-3.5 w-3.5 text-red-600" />;
            case 'unknown':
                return <HelpCircle className="h-3.5 w-3.5 text-muted-foreground" />;
            default: // in-progress
                return <Clock className="h-3.5 w-3.5 text-blue-600" />;
        }
    };

    return <span className="flex items-center justify-center">{getIcon()}</span>;
}
