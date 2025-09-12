import type { Launch } from '../../../models';
import { LaunchCard } from '../../LaunchCard/LaunchCard';

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
        <div className="w-full h-full flex flex-col">
            {/* Fixed Desktop Table Header */}
            <div className="hidden lg:grid lg:grid-cols-12 lg:gap-4 lg:px-6 lg:py-3 lg:border-b lg:bg-muted/20 lg:font-medium lg:text-xs lg:text-muted-foreground lg:uppercase lg:tracking-wider lg:flex-shrink-0">
                <div className="col-span-1">ID</div>
                <div className="col-span-1">Status</div>
                <div className="col-span-4">Launch Name</div>
                <div className="col-span-2">Created</div>
                <div className="col-span-2">Created By</div>
                <div className="col-span-1">Defects</div>
                <div className="col-span-1">Actions</div>
            </div>

            {/* Scrollable Launch Items */}
            <div className="flex-1 overflow-y-auto">
                <div className="space-y-4 lg:space-y-0">
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
            </div>
        </div>
    );
}
