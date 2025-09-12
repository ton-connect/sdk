import { useState } from 'react';
import { LaunchesList } from './LaunchesList/LaunchesList';
import { SearchBar } from './SearchBar/SearchBar';
import { TestCasesSection } from './TestCasesSection/TestCasesSection';
import { CreateLaunchModal } from './CreateLaunchModal';
import { useLaunchesRedux } from '../../hooks/useLaunchesRedux';
import { useAppDispatch, useAppSelector } from '../../store/hooks';
import { setSelectedLaunchId } from '../../store/slices/uiSlice';
import { selectSelectedLaunchId } from '../../store/selectors';
import { Button } from '../ui/button';
import { Alert, AlertDescription } from '../ui/alert';
import { Loader2, AlertTriangle, FileText, X } from 'lucide-react';

export function TestLaunches() {
    const dispatch = useAppDispatch();
    const selectedLaunchId = useAppSelector(selectSelectedLaunchId);
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const {
        search,
        launches,
        loading,
        error,
        completeError,
        complete,
        handleSearchChange,
        handleRefresh,
        clearCompleteError,
        refetch
    } = useLaunchesRedux();

    const openLaunch = (id: number) => {
        dispatch(setSelectedLaunchId(id));
    };

    const handleCreateLaunch = () => {
        setIsCreateModalOpen(true);
    };

    const handleLaunchCreated = (launchId: number) => {
        dispatch(setSelectedLaunchId(launchId));
        setIsCreateModalOpen(false);
    };

    if (error) {
        return (
            <div className="w-full max-w-md mx-auto p-4">
                <Alert className="border-0 bg-destructive/10">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    <AlertDescription className="ml-2">
                        <div className="space-y-3">
                            <div>
                                <h3 className="font-semibold text-destructive">
                                    Failed to load launches
                                </h3>
                                <p className="text-sm text-destructive/80">{String(error)}</p>
                            </div>
                            <Button onClick={() => refetch()} size="sm">
                                Try Again
                            </Button>
                        </div>
                    </AlertDescription>
                </Alert>
            </div>
        );
    }

    // Если выбран ланч, показываем только тест-кейсы
    if (selectedLaunchId) {
        const selectedLaunch = launches.find(launch => launch.id === selectedLaunchId);

        return (
            <TestCasesSection
                launchId={selectedLaunchId}
                onClose={() => dispatch(setSelectedLaunchId(null))}
                onComplete={complete}
                launchClosed={selectedLaunch?.closed}
            />
        );
    }

    // Statistics
    const totalLaunches = launches.length;
    const activeLaunches = launches.filter(l => !l.closed).length;
    const totalDefects = launches.reduce((sum, l) => {
        const newDefects = typeof l.newDefectsCount === 'number' ? l.newDefectsCount : 0;
        const knownDefects = typeof l.knownDefectsCount === 'number' ? l.knownDefectsCount : 0;
        return sum + newDefects + knownDefects;
    }, 0);

    // Иначе показываем список ланчей
    return (
        <div className="w-full h-screen flex flex-col p-4 lg:p-6">
            {/* Fixed Header */}
            <div className="flex-shrink-0 space-y-4 mb-6">
                {/* Header */}
                <div className="space-y-4 lg:space-y-0 lg:flex lg:items-start lg:justify-between lg:gap-6">
                    <div className="space-y-4">
                        {/* Title and action */}
                        <div className="flex flex-col sm:flex-row sm:items-center gap-3 lg:gap-4">
                            <h1 className="text-2xl font-bold">Test Launches</h1>
                            <Button
                                onClick={handleCreateLaunch}
                                className="w-full sm:w-auto h-9 px-4"
                                size="sm"
                            >
                                New Launch
                            </Button>
                        </div>

                        {/* Statistics */}
                        <div className="flex flex-wrap gap-4 sm:gap-6 text-sm text-muted-foreground">
                            <div className="flex items-center gap-2">
                                <span className="font-medium">Total:</span>
                                <span>{totalLaunches}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-medium">Active:</span>
                                <span className="text-blue-600">{activeLaunches}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-medium">Completed:</span>
                                <span className="text-green-600">
                                    {totalLaunches - activeLaunches}
                                </span>
                            </div>
                            {totalDefects > 0 && (
                                <div className="flex items-center gap-2">
                                    <span className="font-medium">Total Defects:</span>
                                    <span className="text-destructive">{totalDefects}</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="lg:mt-0">
                        <SearchBar
                            value={search}
                            loading={loading}
                            onChange={handleSearchChange}
                            onRefresh={handleRefresh}
                        />
                    </div>
                </div>

                {/* Error Alert */}
                {completeError && (
                    <Alert className="border-0 bg-destructive/10">
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                        <AlertDescription className="ml-2 flex items-start justify-between w-full">
                            <div className="flex-1">
                                <h4 className="font-semibold text-destructive text-sm">
                                    Failed to complete launch
                                </h4>
                                <p className="text-xs text-destructive/80 mt-1">{completeError}</p>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={clearCompleteError}
                                className="h-6 w-6 p-0 text-destructive hover:bg-destructive/20"
                            >
                                <X className="h-3 w-3" />
                            </Button>
                        </AlertDescription>
                    </Alert>
                )}
            </div>

            {/* Scrollable Content Area */}
            <div className="flex-1 overflow-hidden">
                {loading && launches.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full space-y-3">
                        <Loader2 className="h-6 w-6 lg:h-8 lg:w-8 animate-spin text-muted-foreground" />
                        <p className="text-sm lg:text-base text-muted-foreground">
                            Loading launches...
                        </p>
                    </div>
                ) : launches.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full space-y-3">
                        <FileText className="h-10 w-10 lg:h-12 lg:w-12 text-muted-foreground/60" />
                        <p className="text-sm lg:text-base text-muted-foreground text-center">
                            {search.trim()
                                ? `No launches found for "${search.trim()}"`
                                : 'No launches found'}
                        </p>
                    </div>
                ) : (
                    <div className="h-full overflow-y-auto">
                        <LaunchesList
                            launches={launches}
                            selectedLaunchId={selectedLaunchId}
                            onOpen={openLaunch}
                            onComplete={complete}
                        />
                    </div>
                )}
            </div>

            <CreateLaunchModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onLaunchCreated={handleLaunchCreated}
            />
        </div>
    );
}
