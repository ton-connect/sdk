import type { Launch } from '../../models';
import { Button } from '../ui/button';
import { Badge } from '../ui/badge';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger
} from '../ui/alert-dialog';

interface LaunchCardProps {
    launch: Launch;
    onOpen: (id: number) => void;
    onComplete: (id: number) => void;
    isSelected: boolean;
}

export function LaunchCard({ launch, onOpen, onComplete, isSelected }: LaunchCardProps) {
    const getStatusVariant = (): 'default' | 'secondary' | 'destructive' | 'outline' => {
        if (launch.closed) {
            return 'default';
        }
        return 'secondary';
    };

    const formatDate = (timestamp: number) => {
        return new Date(timestamp).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const getDefectsSummary = () => {
        const newDefects = typeof launch.newDefectsCount === 'number' ? launch.newDefectsCount : 0;
        const knownDefects =
            typeof launch.knownDefectsCount === 'number' ? launch.knownDefectsCount : 0;
        const total = newDefects + knownDefects;
        if (total === 0) return null;
        return `${newDefects} new, ${knownDefects} known`;
    };

    const getTotalDefects = () => {
        const newDefects = typeof launch.newDefectsCount === 'number' ? launch.newDefectsCount : 0;
        const knownDefects =
            typeof launch.knownDefectsCount === 'number' ? launch.knownDefectsCount : 0;
        return newDefects + knownDefects;
    };

    return (
        <div
            className={`
                w-full
                bg-background
                border-b border-border
                transition-all duration-200 
                cursor-pointer
                hover:bg-muted/30
                ${isSelected ? 'bg-muted/50 border-l-4 border-l-primary' : ''}
            `}
            onClick={() => onOpen(launch.id)}
        >
            {/* Mobile Layout */}
            <div className="block lg:hidden p-4 space-y-4 border border-border rounded-lg mx-4 my-2 bg-card">
                {/* Header with status and ID */}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Badge variant={getStatusVariant()} className="text-xs font-medium">
                            {launch.closed ? 'Closed' : 'Open'}
                        </Badge>
                        {getDefectsSummary() && (
                            <span className="text-xs px-2 py-1 bg-destructive/10 text-destructive rounded">
                                {getTotalDefects()} defects
                            </span>
                        )}
                    </div>
                    <span className="text-xs text-muted-foreground font-mono">#{launch.id}</span>
                </div>

                {/* Launch name */}
                <h3 className="text-lg font-semibold text-foreground line-clamp-2 leading-tight">
                    {launch.name}
                </h3>

                {/* Metadata grid */}
                <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm">
                    <div>
                        <span className="text-muted-foreground">Created:</span>
                        <div className="font-medium">{formatDate(launch.createdDate)}</div>
                    </div>
                    <div>
                        <span className="text-muted-foreground">By:</span>
                        <div className="font-medium truncate">{launch.createdBy || 'Unknown'}</div>
                    </div>
                    <div>
                        <span className="text-muted-foreground">Modified:</span>
                        <div className="font-medium">{formatDate(launch.lastModifiedDate)}</div>
                    </div>
                    <div>
                        <span className="text-muted-foreground">Status:</span>
                        <div className="font-medium">{launch.status || 'Unknown'}</div>
                    </div>
                </div>

                {/* Defects summary (if any) */}
                {getDefectsSummary() && (
                    <div className="p-3 bg-destructive/5 border border-destructive/20 rounded-lg">
                        <div className="text-sm font-medium text-destructive mb-1">
                            Issues Found
                        </div>
                        <div className="text-xs text-destructive/80">{getDefectsSummary()}</div>
                    </div>
                )}

                {/* Actions */}
                <div className="flex gap-3 pt-2">
                    <Button
                        onClick={e => {
                            e.stopPropagation();
                            onOpen(launch.id);
                        }}
                        className="flex-1 h-11"
                        size="default"
                    >
                        View Details
                    </Button>

                    {!launch.closed && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    onClick={e => e.stopPropagation()}
                                    variant="outline"
                                    className="flex-1 h-11"
                                    size="default"
                                >
                                    Mark Complete
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Complete Launch?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Are you sure you want to mark launch "{launch.name}" as
                                        complete? This action cannot be undone and will close the
                                        launch for further testing.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={() => onComplete(launch.id)}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                        Complete Launch
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                </div>
            </div>

            {/* Desktop Table Layout */}
            <div className="hidden lg:grid lg:grid-cols-12 lg:gap-4 lg:px-6 lg:py-3 lg:items-center">
                <div className="col-span-1 text-sm font-mono text-muted-foreground">
                    #{launch.id}
                </div>
                <div className="col-span-1">
                    <Badge variant={getStatusVariant()} className="text-xs">
                        {launch.closed ? 'Closed' : 'Open'}
                    </Badge>
                </div>

                <div className="col-span-4 font-medium text-foreground truncate">{launch.name}</div>

                <div className="col-span-2 text-sm text-muted-foreground">
                    {formatDate(launch.createdDate)}
                </div>

                <div className="col-span-2 text-sm text-muted-foreground truncate">
                    {launch.createdBy || 'Unknown'}
                </div>

                <div className="col-span-1 text-sm">
                    {getDefectsSummary() ? (
                        <span className="text-destructive text-xs">
                            {getTotalDefects()} defects
                        </span>
                    ) : (
                        <span className="text-green-600 text-xs">No defects</span>
                    )}
                </div>

                <div className="col-span-1 flex gap-1">
                    {!launch.closed && (
                        <AlertDialog>
                            <AlertDialogTrigger asChild>
                                <Button
                                    onClick={e => e.stopPropagation()}
                                    variant="outline"
                                    size="sm"
                                    className="h-7 px-2 text-xs"
                                >
                                    Complete
                                </Button>
                            </AlertDialogTrigger>
                            <AlertDialogContent>
                                <AlertDialogHeader>
                                    <AlertDialogTitle>Complete Launch?</AlertDialogTitle>
                                    <AlertDialogDescription>
                                        Are you sure you want to mark launch "{launch.name}" as
                                        complete? This action cannot be undone and will close the
                                        launch for further testing.
                                    </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                                    <AlertDialogAction
                                        onClick={() => onComplete(launch.id)}
                                        className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                    >
                                        Complete Launch
                                    </AlertDialogAction>
                                </AlertDialogFooter>
                            </AlertDialogContent>
                        </AlertDialog>
                    )}
                </div>
            </div>
        </div>
    );
}
