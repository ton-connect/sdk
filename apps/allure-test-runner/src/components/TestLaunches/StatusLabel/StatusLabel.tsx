import './StatusLabel.scss';

type StatusLabelProps = {
    status?: 'unknown' | 'passed' | 'failed';
};

export function StatusLabel({ status }: StatusLabelProps) {
    // If status is undefined, consider it as "in progress"
    const displayStatus = status || 'in-progress';
    
    const getIcon = () => {
        switch (displayStatus) {
            case 'passed':
                return (
                    <svg className="status-icon status-icon--passed" viewBox="0 0 24 24" fill="none">
                        <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z" fill="currentColor"/>
                    </svg>
                );
            case 'failed':
                return (
                    <svg className="status-icon status-icon--failed" viewBox="0 0 24 24" fill="none">
                        <path d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z" fill="currentColor"/>
                    </svg>
                );
            case 'unknown':
                return (
                    <svg className="status-icon status-icon--unknown" viewBox="0 0 24 24" fill="none">
                        <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92C13.45 12.9 13 13.5 13 15h-2v-.5c0-1.1.45-2.1 1.17-2.83l1.24-1.26c.37-.36.59-.86.59-1.41 0-1.1-.9-2-2-2s-2 .9-2 2H8c0-2.21 1.79-4 4-4s4 1.79 4 4c0 .88-.36 1.68-.93 2.25z" fill="currentColor"/>
                    </svg>
                );
            default: // in-progress
                return (
                    <svg className="status-icon status-icon--in-progress" viewBox="0 0 24 24" fill="none">
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" stroke="currentColor" strokeWidth="2" fill="none"/>
                    </svg>
                );
        }
    };
    
    return (
        <span className={`status-checkbox status-checkbox--${displayStatus}`}>
            {getIcon()}
        </span>
    );
}
