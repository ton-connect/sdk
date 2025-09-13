import { useState } from 'react';
import { TestCaseDetails } from '../TestCaseDetails';
import { StatusLabel } from '../StatusLabel/StatusLabel';
import { TreeNavigation } from '../TreeNavigation';
import { Loader } from '../Loader';
import { ExpandableGroup } from '../ExpandableGroup';
import { useTestCases } from './hooks';
import type { TestCaseGroup, TestCaseItem } from '../../../models';
import { Alert, AlertDescription } from '../../ui/alert';
import {
    ArrowLeft,
    AlertTriangle,
    LayoutGrid,
    LayoutList,
    MoreVertical,
    CheckCircle,
    PanelLeftClose,
    PanelLeftOpen,
    FileText
} from 'lucide-react';
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
} from '../../ui/alert-dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger
} from '../../ui/dropdown-menu';
import { Stack } from '../../ui/layout';
import { Title, Body } from '../../ui/typography';
import { Button } from '../../ui/button';

type Props = {
    launchId: number;
    onClose: () => void;
    onComplete?: (id: number) => void;
    launchClosed?: boolean;
};

export function TestCasesSection({ launchId, onClose, onComplete, launchClosed = false }: Props) {
    const {
        content,
        selectedTestId,
        loading,
        error,
        viewMode,
        pathHistory,
        openTest,
        refreshTestCases,
        goBack,
        goToRoot,
        toggleViewMode,
        navigateToLevel,
        toggleGroup,
        isGroupExpanded,
        getGroupContents,
        isGroupLoading,
        hasGroupBeenLoaded
    } = useTestCases(launchId);

    const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

    const toggleSidebar = () => setIsSidebarCollapsed(!isSidebarCollapsed);

    return (
        <div className="h-screen-safe flex flex-col bg-background">
            {/* Professional Header */}
            <div className="flex-shrink-0 border-b border-border bg-background">
                <div className="flex items-center justify-between px-4 py-3">
                    <div className="flex items-center gap-4">
                        <Button
                            onClick={onClose}
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 hover:bg-muted"
                        >
                            <ArrowLeft className="h-4 w-4 mr-1" />
                            <span className="hidden sm:inline">Back</span>
                        </Button>
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <Title className="text-base font-semibold">Launch #{launchId}</Title>
                        </div>
                    </div>

                    {/* Actions Dropdown */}
                    {!launchClosed && onComplete && (
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    size="sm"
                                    className="h-8 px-2 hover:bg-muted"
                                >
                                    <MoreVertical className="h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end" className="w-48">
                                <AlertDialog>
                                    <AlertDialogTrigger asChild>
                                        <DropdownMenuItem onSelect={e => e.preventDefault()}>
                                            <CheckCircle className="h-4 w-4 mr-2" />
                                            Complete Launch
                                        </DropdownMenuItem>
                                    </AlertDialogTrigger>
                                    <AlertDialogContent>
                                        <AlertDialogHeader>
                                            <AlertDialogTitle>
                                                Complete Launch #{launchId}?
                                            </AlertDialogTitle>
                                            <AlertDialogDescription>
                                                Are you sure you want to complete this launch? This
                                                action cannot be undone and will close the launch
                                                for further testing.
                                            </AlertDialogDescription>
                                        </AlertDialogHeader>
                                        <AlertDialogFooter>
                                            <AlertDialogCancel>Cancel</AlertDialogCancel>
                                            <AlertDialogAction
                                                onClick={() => onComplete(launchId)}
                                                className="bg-green-600 text-white hover:bg-green-700"
                                            >
                                                Complete Launch
                                            </AlertDialogAction>
                                        </AlertDialogFooter>
                                    </AlertDialogContent>
                                </AlertDialog>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    )}
                </div>

                {/* Tree Navigation - Fixed height container to prevent header jumping */}
                <div className={`px-4 transition-all duration-200 pb-0`}>
                    {viewMode === 'tree' && (
                        <TreeNavigation
                            pathHistory={pathHistory}
                            onGoToRoot={goToRoot}
                            onGoBack={goBack}
                            onNavigateTo={navigateToLevel}
                            loading={loading}
                        />
                    )}
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 min-h-0 overflow-hidden">
                {error ? (
                    <div className="flex items-center justify-center h-full p-4">
                        <Alert className="border-0 bg-destructive/10 max-w-md">
                            <AlertTriangle className="h-4 w-4 text-destructive" />
                            <AlertDescription className="ml-2">
                                <Stack spacing="tight">
                                    <Body className="font-semibold text-destructive">
                                        Failed to load test cases
                                    </Body>
                                    <Body className="text-destructive/80">
                                        Please try refreshing the page or check your connection.
                                    </Body>
                                </Stack>
                            </AlertDescription>
                        </Alert>
                    </div>
                ) : loading && content.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <Stack spacing="tight" className="items-center">
                            <Loader size="large" text="Loading test cases..." />
                        </Stack>
                    </div>
                ) : content.length === 0 ? (
                    <div className="flex items-center justify-center h-full">
                        <Stack spacing="tight" className="items-center">
                            <LayoutList className="h-12 w-12 text-muted-foreground/60" />
                            <Body className="text-muted-foreground">No test cases found</Body>
                        </Stack>
                    </div>
                ) : (
                    <div
                        className={`h-full grid gap-0.5 bg-border overflow-hidden transition-all duration-300 ${
                            isSidebarCollapsed
                                ? 'grid-cols-1'
                                : 'grid-rows-[35%_1fr] md:grid-rows-1 md:grid-cols-[380px_1fr] lg:grid-cols-[420px_1fr]'
                        }`}
                    >
                        {/* Test Cases List */}
                        <div
                            className={`flex flex-col bg-background h-full overflow-hidden transition-all duration-300 ${
                                isSidebarCollapsed ? 'hidden' : 'flex'
                            }`}
                        >
                            <div className="flex items-center justify-between px-3 py-2.5 border-b border-border bg-background flex-shrink-0">
                                <Title className="text-sm font-semibold">Test Cases</Title>

                                {/* View Mode Dropdown */}
                                <div className="flex items-center gap-1">
                                    <DropdownMenu>
                                        <DropdownMenuTrigger asChild>
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                className="h-7 px-2 text-xs hover:bg-muted"
                                            >
                                                {viewMode === 'tree' ? (
                                                    <LayoutGrid className="h-3 w-3 mr-1" />
                                                ) : (
                                                    <LayoutList className="h-3 w-3 mr-1" />
                                                )}
                                                {viewMode === 'tree' ? 'Tree' : 'Flat'}
                                            </Button>
                                        </DropdownMenuTrigger>
                                        <DropdownMenuContent align="end" className="w-32">
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    viewMode !== 'tree' && toggleViewMode()
                                                }
                                                className={viewMode === 'tree' ? 'bg-accent' : ''}
                                            >
                                                <LayoutGrid className="h-3 w-3 mr-2" />
                                                Tree View
                                            </DropdownMenuItem>
                                            <DropdownMenuItem
                                                onClick={() =>
                                                    viewMode !== 'flat' && toggleViewMode()
                                                }
                                                className={viewMode === 'flat' ? 'bg-accent' : ''}
                                            >
                                                <LayoutList className="h-3 w-3 mr-2" />
                                                Flat View
                                            </DropdownMenuItem>
                                        </DropdownMenuContent>
                                    </DropdownMenu>
                                </div>
                            </div>
                            <div className="flex-1 overflow-y-auto bg-background min-h-0 max-h-full">
                                {content.map(item => {
                                    if (item.type === 'GROUP') {
                                        const group = item as TestCaseGroup;
                                        return (
                                            <ExpandableGroup
                                                key={group.id}
                                                group={group}
                                                isExpanded={isGroupExpanded(group.id)}
                                                contents={getGroupContents(group.id)}
                                                onToggle={toggleGroup}
                                                onTestSelect={openTest}
                                                selectedTestId={selectedTestId}
                                                loading={isGroupLoading(group.id)}
                                                hasBeenLoaded={hasGroupBeenLoaded(group.id)}
                                                isGroupExpanded={isGroupExpanded}
                                                getGroupContents={getGroupContents}
                                                isGroupLoading={isGroupLoading}
                                                hasGroupBeenLoaded={hasGroupBeenLoaded}
                                            />
                                        );
                                    } else {
                                        const testCase = item as TestCaseItem;
                                        return (
                                            <div
                                                key={testCase.id}
                                                className={`group px-3 py-2.5 border-b border-border/50 last:border-b-0 cursor-pointer hover:bg-muted/30 transition-all duration-200 ${
                                                    selectedTestId === testCase.id
                                                        ? 'bg-primary/5 border-l-2 border-l-primary shadow-sm'
                                                        : 'border-l-2 border-l-transparent hover:border-l-muted-foreground/30'
                                                }`}
                                                onClick={() => openTest(testCase.id)}
                                            >
                                                <div className="flex items-center justify-between gap-3">
                                                    <div className="flex items-center gap-2 min-w-0 flex-1">
                                                        {/* Clean test file icon - consistent sizing */}
                                                        <div className="flex items-center justify-center w-3.5 h-3.5 flex-shrink-0">
                                                            <FileText
                                                                className={`w-3.5 h-3.5 transition-colors ${
                                                                    selectedTestId === testCase.id
                                                                        ? 'text-primary'
                                                                        : 'text-muted-foreground group-hover:text-foreground'
                                                                }`}
                                                            />
                                                        </div>
                                                        <Body className="font-medium text-sm truncate leading-relaxed">
                                                            {testCase.name}
                                                        </Body>
                                                    </div>
                                                    <div className="flex-shrink-0">
                                                        <StatusLabel status={testCase.status} />
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }
                                })}
                            </div>
                        </div>

                        {/* Test Case Details */}
                        <div className="flex flex-col bg-background h-full overflow-hidden">
                            <div className="flex items-center justify-between px-3 py-2.5 border-b border-border bg-background flex-shrink-0">
                                <div className="flex items-center gap-2">
                                    {/* Sidebar Toggle */}
                                    <Button
                                        onClick={toggleSidebar}
                                        variant="ghost"
                                        size="sm"
                                        className="h-7 w-7 p-0"
                                        title={
                                            isSidebarCollapsed
                                                ? 'Show Test Cases'
                                                : 'Hide Test Cases'
                                        }
                                    >
                                        {isSidebarCollapsed ? (
                                            <>
                                                {/* Desktop: Panel Left */}
                                                <PanelLeftOpen className="h-3 w-3 hidden md:block" />
                                                {/* Mobile: Panel rotated 90 degrees */}
                                                <PanelLeftOpen className="h-3 w-3 md:hidden rotate-90" />
                                            </>
                                        ) : (
                                            <>
                                                {/* Desktop: Panel Left */}
                                                <PanelLeftClose className="h-3 w-3 hidden md:block" />
                                                {/* Mobile: Panel rotated 90 degrees */}
                                                <PanelLeftClose className="h-3 w-3 md:hidden rotate-90" />
                                            </>
                                        )}
                                    </Button>
                                    <Title className="text-sm font-semibold">Test Details</Title>
                                </div>

                                {/* Optional: Test navigation counter */}
                                {selectedTestId && (
                                    <Body className="text-xs text-muted-foreground">
                                        Test #{selectedTestId}
                                    </Body>
                                )}
                            </div>
                            <div className="flex-1 bg-background overflow-hidden min-h-0 max-h-full flex flex-col">
                                <TestCaseDetails
                                    testId={selectedTestId}
                                    onTestCasesRefresh={refreshTestCases}
                                    onTestIdChange={openTest}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
