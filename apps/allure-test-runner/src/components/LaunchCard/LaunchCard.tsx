import type { Launch } from '../../models';
import './LaunchCard.scss';

interface LaunchCardProps {
    launch: Launch;
    onOpen: (id: number) => void;
    onComplete: (id: number) => void;
    isSelected: boolean;
}

export function LaunchCard({ launch, onOpen, onComplete, isSelected }: LaunchCardProps) {
    const getStatusColor = () => {
        if (launch.closed) {
            return 'status-success';
        }
        return 'status-warning';
    };

    return (
        <div className={`launch-card ${isSelected ? 'launch-card--selected' : ''}`}>
            <div className="launch-card__header">
                <span className={`status-badge ${getStatusColor()}`}>
                    {launch.closed ? 'Completed' : 'Running'}
                </span>
                <span className="launch-card__id">#{launch.id}</span>
            </div>

            <h3 className="launch-card__title">{launch.name}</h3>

            {launch.description && <p className="launch-card__description">{launch.description}</p>}

            <div className="launch-card__actions">
                <button
                    onClick={e => {
                        e.stopPropagation();
                        onOpen(launch.id);
                    }}
                    className="btn btn-primary launch-card__btn"
                >
                    Open
                </button>

                {!launch.closed && (
                    <button
                        onClick={e => {
                            e.stopPropagation();
                            onComplete(launch.id);
                        }}
                        className="btn btn-success"
                    >
                        Complete
                    </button>
                )}
            </div>
        </div>
    );
}
