import { StatusLabel } from '../StatusLabel/StatusLabel';

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

    return (
        <>
            <div className="test-case-details-name">
                <h3 className="test-case-details-name-title">{name}</h3>
            </div>

            <div className="test-case-details-header">
                <div className="test-case-details-status-label">Status:</div>
                <div className="test-case-details-status">
                    <StatusLabel status={status} />
                </div>
                <div className="test-case-details-status-text">{getStatusText(status)}</div>
            </div>

            {message && (
                <div className="test-case-details-message">
                    <div className="test-case-details-message-label">Message:</div>
                    <div className="test-case-details-message-text">{message}</div>
                </div>
            )}
        </>
    );
}
