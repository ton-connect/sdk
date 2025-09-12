import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { InfiniteScrollLaunchesList } from '../components/TestLaunches/InfiniteScrollLaunchesList/InfiniteScrollLaunchesList';
import { SearchBar } from '../components/TestLaunches/SearchBar/SearchBar';
import { CreateLaunchModal } from '../components/TestLaunches/CreateLaunchModal';
import { useLaunchesRedux } from '../hooks/useLaunchesRedux';
import { Alert, AlertDescription } from '../components/ui/alert';
import { AlertTriangle, X } from 'lucide-react';
import {
    PageContainer,
    ContentContainer,
    ScrollArea,
    Stack,
    Inline
} from '../components/ui/layout';
import { LargeTitle, Body } from '../components/ui/typography';
import { Metric, MetricsGroup } from '../components/ui/status';
import { CleanButton } from '../components/ui/form-field';

export function LaunchesPage() {
    const navigate = useNavigate();
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);

    const {
        search,
        launches,
        loading,
        loadingMore,
        error,
        completeError,
        hasMore,
        complete,
        handleSearchChange,
        handleRefresh,
        clearCompleteError,
        refetch,
        loadMore
    } = useLaunchesRedux();

    const openLaunch = (id: number) => {
        navigate(`/launches/${id}`);
    };

    const handleCreateLaunch = () => {
        setIsCreateModalOpen(true);
    };

    const handleLaunchCreated = (launchId: number) => {
        navigate(`/launches/${launchId}`);
        setIsCreateModalOpen(false);
    };

    if (error) {
        return (
            <PageContainer>
                <ContentContainer className="flex items-center justify-center">
                    <Alert className="border-0 bg-destructive/10 max-w-md">
                        <AlertTriangle className="h-4 w-4 text-destructive" />
                        <AlertDescription className="ml-2">
                            <Stack spacing="tight">
                                <div>
                                    <Body className="font-semibold text-destructive">
                                        Failed to load launches
                                    </Body>
                                    <Body className="text-destructive/80">{String(error)}</Body>
                                </div>
                                <CleanButton onClick={() => refetch()} size="default">
                                    Try Again
                                </CleanButton>
                            </Stack>
                        </AlertDescription>
                    </Alert>
                </ContentContainer>
            </PageContainer>
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

    return (
        <PageContainer>
            {/* Fixed Header */}
            <ContentContainer>
                <Stack spacing="normal">
                    {/* Title and Controls */}
                    <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4 lg:gap-6">
                        <Stack spacing="normal">
                            {/* Title and action */}
                            <Inline
                                spacing="normal"
                                className="flex-col sm:flex-row sm:items-center"
                            >
                                <LargeTitle>Test Launches</LargeTitle>
                                <CleanButton
                                    onClick={handleCreateLaunch}
                                    className="w-full sm:w-auto"
                                    size="default"
                                >
                                    New Launch
                                </CleanButton>
                            </Inline>

                            {/* Statistics */}
                            <MetricsGroup>
                                <Metric label="Total" value={totalLaunches} />
                                <Metric label="Active" value={activeLaunches} variant="default" />
                                <Metric
                                    label="Completed"
                                    value={totalLaunches - activeLaunches}
                                    variant="success"
                                />
                                {totalDefects > 0 && (
                                    <Metric
                                        label="Total Defects"
                                        value={totalDefects}
                                        variant="danger"
                                    />
                                )}
                            </MetricsGroup>
                        </Stack>

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
                                    <Body className="font-semibold text-destructive">
                                        Failed to complete launch
                                    </Body>
                                    <Body className="text-destructive/80 mt-1">
                                        {completeError}
                                    </Body>
                                </div>
                                <CleanButton
                                    variant="ghost"
                                    size="default"
                                    onClick={clearCompleteError}
                                    className="h-6 w-6 p-0 text-destructive hover:bg-destructive/20"
                                >
                                    <X className="h-3 w-3" />
                                </CleanButton>
                            </AlertDescription>
                        </Alert>
                    )}
                </Stack>
            </ContentContainer>

            {/* Scrollable Content Area */}
            <ScrollArea>
                <InfiniteScrollLaunchesList
                    launches={launches}
                    selectedLaunchId={null}
                    loading={loading}
                    loadingMore={loadingMore}
                    hasMore={hasMore}
                    onOpen={openLaunch}
                    onComplete={complete}
                    onLoadMore={loadMore}
                />
            </ScrollArea>

            <CreateLaunchModal
                isOpen={isCreateModalOpen}
                onClose={() => setIsCreateModalOpen(false)}
                onLaunchCreated={handleLaunchCreated}
            />
        </PageContainer>
    );
}
