import type { Launch } from '../../../models';

type Props = {
    launches: Launch[];
    selectedLaunchId: number | null;
    onOpen: (id: number) => void;
    onComplete: (id: number) => void;
    onCreateLaunch?: () => void;
};

export function LaunchesList({ launches, selectedLaunchId, onOpen, onComplete, onCreateLaunch }: Props) {
    if (launches.length === 0) {
        return null;
    }

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <div className="launches-table">
            <div className="launches-table__header">
                <div className="launches-table__header-cell">ID</div>
                <div className="launches-table__header-cell">Name</div>
                <div className="launches-table__header-cell">Status</div>
                <div className="launches-table__header-cell">Created</div>
                <div className="launches-table__header-cell">Created By</div>
                <div className="launches-table__header-cell">Actions</div>
            </div>
            <div className="launches-table__body">
                {launches.map(launch => (
                    <div
                        key={launch.id}
                        className={`launches-table__row ${selectedLaunchId === launch.id ? 'launches-table__row--selected' : ''}`}
                        onClick={() => onOpen(launch.id)}
                    >
                        <div className="launches-table__cell launches-table__cell--id">
                            #{launch.id}
                        </div>
                        <div className="launches-table__cell launches-table__cell--name">
                            {launch.name}
                        </div>
                        <div className="launches-table__cell launches-table__cell--status">
                            <span className={`status-badge ${launch.closed ? 'closed' : 'open'}`}>
                                {launch.closed ? 'Closed' : 'Open'}
                            </span>
                        </div>
                        <div className="launches-table__cell launches-table__cell--created">
                            {formatDate(launch.createdDate)}
                        </div>
                        <div className="launches-table__cell launches-table__cell--author">
                            {launch.createdBy}
                        </div>
                        <div className="launches-table__cell launches-table__cell--actions">
                            {!launch.closed && (
                                <button
                                    className="btn btn-success btn-sm"
                                    onClick={e => {
                                        e.stopPropagation();
                                        onComplete(launch.id);
                                    }}
                                >
                                    Complete
                                </button>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
