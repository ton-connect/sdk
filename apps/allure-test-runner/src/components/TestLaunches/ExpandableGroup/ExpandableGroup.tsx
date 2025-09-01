import { StatusLabel } from '../StatusLabel/StatusLabel';
import { GroupStatistic } from '../GroupStatistic';
import { Loader } from '../Loader';
import type { TestCaseGroup, TestCaseItem, TestCase } from '../../../models';
import './ExpandableGroup.scss';

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
                <div key={item.id} className={`nested-group nested-group--depth-${depth}`}>
                    <div
                        className={`nested-group__header ${nestedExpanded ? 'nested-group__header--expanded' : ''}`}
                        onClick={() => onToggle(item.id)}
                        role="button"
                        tabIndex={0}
                        onKeyDown={e => {
                            if (e.key === 'Enter' || e.key === ' ') {
                                onToggle(item.id);
                            }
                        }}
                    >
                        <span
                            className={`nested-group__chevron ${nestedExpanded ? 'nested-group__chevron--expanded' : ''}`}
                        >
                            ▶
                        </span>
                        <span className="nested-group__icon">📁</span>
                        <span className="nested-group__name">{item.name}</span>
                        <GroupStatistic statistic={item.statistic} />
                    </div>

                    {nestedExpanded && (
                        <div className="nested-group__content">
                            {nestedLoading || (!nestedHasLoaded && nestedContents.length === 0) ? (
                                <div className="nested-group__loading">
                                    <Loader size="small" text="Loading group content..." />
                                </div>
                            ) : nestedContents.length === 0 ? (
                                <div className="nested-group__empty">
                                    No items found in this group
                                </div>
                            ) : (
                                <div className="nested-group__items">
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
                    className={`group-test-item ${
                        selectedTestId === testCase.id ? 'group-test-item--selected' : ''
                    }`}
                    onClick={() => onTestSelect(testCase.id)}
                >
                    <div className="group-test-item__name">{testCase.name}</div>
                    <div className="group-test-item__status">
                        <StatusLabel status={testCase.status} />
                    </div>
                </div>
            );
        }
    };

    return (
        <div className="expandable-group">
            <div
                className={`expandable-group__header ${isExpanded ? 'expandable-group__header--expanded' : ''}`}
                onClick={handleToggle}
            >
                <div className="expandable-group__left">
                    <div
                        className={`expandable-group__chevron ${isExpanded ? 'expandable-group__chevron--expanded' : ''}`}
                    >
                        ▶
                    </div>
                    <div className="expandable-group__icon">📁</div>
                    <div className="expandable-group__name">{group.name}</div>
                </div>
                <div className="expandable-group__right">
                    <GroupStatistic statistic={group.statistic} />
                </div>
            </div>

            {isExpanded && (
                <div className="expandable-group__content">
                    {loading || (!hasBeenLoaded && contents.length === 0) ? (
                        <div className="expandable-group__loading">
                            <Loader size="small" text="Loading group content..." />
                        </div>
                    ) : contents.length === 0 ? (
                        <div className="expandable-group__empty">No items found in this group</div>
                    ) : (
                        <div className="expandable-group__items">
                            {contents.map(item => renderItem(item))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
