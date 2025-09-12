import { StatusLabel } from '../StatusLabel/StatusLabel';
import { GroupStatistic } from '../GroupStatistic';
import { Loader } from '../Loader';
import type { TestCaseGroup, TestCaseItem, TestCase } from '../../../models';
import { FolderIcon, FileText } from 'lucide-react';
import { Body, Caption } from '../../ui/typography';

type ExpandableGroupProps = {
    group: TestCaseGroup;
    isExpanded: boolean;
    contents: TestCase[];
    onToggle: (groupId: number) => void;
    onTestSelect: (testId: number) => void;
    selectedTestId: number | null;
    loading?: boolean;
    hasBeenLoaded?: boolean;
    isGroupExpanded: (groupId: number) => boolean;
    getGroupContents: (groupId: number) => TestCase[];
    isGroupLoading: (groupId: number) => boolean;
    hasGroupBeenLoaded: (groupId: number) => boolean;
};

export function ExpandableGroup({
    group,
    isExpanded,
    contents,
    onToggle,
    onTestSelect,
    selectedTestId,
    loading = false,
    hasBeenLoaded = false,
    isGroupExpanded,
    getGroupContents,
    isGroupLoading,
    hasGroupBeenLoaded
}: ExpandableGroupProps) {
    const handleToggle = () => {
        onToggle(group.id);
    };

    const renderItem = (item: TestCase, depth = 0) => {
        if (item.type === 'GROUP') {
            const nestedExpanded = isGroupExpanded(item.id);
            const nestedLoading = isGroupLoading(item.id);
            const nestedHasLoaded = hasGroupBeenLoaded(item.id);
            const nestedContents = getGroupContents(item.id);

            return (
                <div key={item.id} className="border-b border-border/50 last:border-b-0">
                    <div
                        className="group flex items-center justify-between cursor-pointer hover:bg-muted/30 transition-all duration-200 border-l-2 border-l-transparent hover:border-l-muted-foreground/30"
                        style={{
                            paddingLeft: `${12 + depth * 16}px`,
                            paddingRight: '12px',
                            paddingTop: '10px',
                            paddingBottom: '10px'
                        }}
                        onClick={() => onToggle(item.id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={e => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                onToggle(item.id);
                            }
                        }}
                    >
                        <div className="flex items-center gap-2 min-w-0 flex-1">
                            {/* Clean folder icon - consistent sizing */}
                            <div className="flex items-center justify-center w-3.5 h-3.5 flex-shrink-0">
                                <FolderIcon
                                    className={`w-3.5 h-3.5 transition-colors ${
                                        nestedExpanded
                                            ? 'text-blue-600'
                                            : 'text-muted-foreground group-hover:text-foreground'
                                    }`}
                                />
                            </div>
                            <Body className="font-medium text-sm truncate">{item.name}</Body>
                        </div>
                        <GroupStatistic statistic={item.statistic} />
                    </div>

                    {nestedExpanded && (
                        <div
                            className="bg-muted/10 border-l border-l-muted-foreground/20"
                            style={{ marginLeft: `${depth * 16 + 8}px` }}
                        >
                            {nestedLoading || (!nestedHasLoaded && nestedContents.length === 0) ? (
                                <div className="flex items-center justify-center py-3 min-h-[2.5rem]">
                                    <Loader
                                        size="small"
                                        text="Loading group content..."
                                        horizontal
                                    />
                                </div>
                            ) : nestedContents.length === 0 ? (
                                <div className="flex items-center justify-center py-3 min-h-[2.5rem]">
                                    <Caption className="text-muted-foreground italic">
                                        No items found in this group
                                    </Caption>
                                </div>
                            ) : (
                                <div>
                                    {nestedContents.map(child => renderItem(child, depth + 1))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            );
        } else {
            const testCase = item as TestCaseItem;
            return (
                <div
                    key={testCase.id}
                    className={`group cursor-pointer border-b border-border/50 last:border-b-0 hover:bg-muted/30 transition-all duration-200 ${
                        selectedTestId === testCase.id
                            ? 'bg-primary/5 border-l-2 border-l-primary shadow-sm'
                            : 'border-l-2 border-l-transparent hover:border-l-muted-foreground/30'
                    }`}
                    onClick={() => onTestSelect(testCase.id)}
                    style={{
                        paddingLeft: `${12 + depth * 16}px`,
                        paddingRight: '12px',
                        paddingTop: '10px',
                        paddingBottom: '10px'
                    }}
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
                        <StatusLabel status={testCase.status} />
                    </div>
                </div>
            );
        }
    };

    return (
        <div className="border-b border-border/50 last:border-b-0">
            <div
                className="group flex items-center justify-between px-3 py-2.5 cursor-pointer hover:bg-muted/30 transition-all duration-200 border-l-2 border-l-transparent hover:border-l-muted-foreground/30"
                onClick={handleToggle}
            >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                    {/* Clean folder icon - consistent sizing, no arrows */}
                    <div className="flex items-center justify-center w-4 h-4 flex-shrink-0">
                        <FolderIcon
                            className={`w-4 h-4 transition-colors ${
                                isExpanded
                                    ? 'text-blue-600'
                                    : 'text-muted-foreground group-hover:text-foreground'
                            }`}
                        />
                    </div>
                    <Body className="font-semibold text-sm truncate">{group.name}</Body>
                </div>
                <GroupStatistic statistic={group.statistic} />
            </div>

            {isExpanded && (
                <div className="bg-muted/10 border-l border-l-muted-foreground/20 ml-2">
                    {loading || (!hasBeenLoaded && contents.length === 0) ? (
                        <div className="flex items-center justify-center py-3 min-h-[2.5rem]">
                            <Loader size="small" text="Loading group content..." horizontal />
                        </div>
                    ) : contents.length === 0 ? (
                        <div className="flex items-center justify-center py-3 min-h-[2.5rem]">
                            <Caption className="text-muted-foreground italic">
                                No items found in this group
                            </Caption>
                        </div>
                    ) : (
                        <div>{contents.map(item => renderItem(item))}</div>
                    )}
                </div>
            )}
        </div>
    );
}
