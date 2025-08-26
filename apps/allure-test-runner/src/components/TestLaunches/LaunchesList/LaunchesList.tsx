import type { Launch } from '../../../models';
import { LaunchCard } from '../../LaunchCard';

type Props = {
    launches: Launch[];
    selectedLaunchId: number | null;
    onOpen: (id: number) => void;
    onComplete: (id: number) => void;
};

export function LaunchesList({ launches, selectedLaunchId, onOpen, onComplete }: Props) {
    if (launches.length === 0) {
        return null;
    }

    return (
        <div className="test-runs__grid test-runs__grid--launches">
            {launches.map(launch => (
                <LaunchCard
                    key={launch.id}
                    launch={launch}
                    onOpen={onOpen}
                    onComplete={onComplete}
                    isSelected={selectedLaunchId === launch.id}
                />
            ))}
        </div>
    );
}
