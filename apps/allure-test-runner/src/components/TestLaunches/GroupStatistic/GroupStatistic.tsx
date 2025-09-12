import type { TestCaseStatistic } from '../../../models';
import { Caption } from '../../ui/typography';
import { Inline } from '../../ui/layout';

type GroupStatisticProps = {
    statistic: TestCaseStatistic;
};

export function GroupStatistic({ statistic }: GroupStatisticProps) {
    // Keep only the essential stats: Passed, Failed, In Progress
    const stats = [
        { key: 'passed', label: 'P', value: statistic.passed, colorClass: 'text-green-600' },
        { key: 'failed', label: 'F', value: statistic.failed, colorClass: 'text-red-600' },
        { key: 'inProgress', label: 'I', value: statistic.inProgress, colorClass: 'text-blue-600' }
    ];

    const nonZeroStats = stats.filter(stat => stat.value > 0);

    return (
        <Inline spacing="tight" className="flex-shrink-0">
            {nonZeroStats.length > 0 && (
                <Inline spacing="tight">
                    {nonZeroStats.map(stat => (
                        <Caption
                            key={stat.key}
                            className={`font-medium ${stat.colorClass}`}
                            title={`${
                                stat.label === 'P'
                                    ? 'Passed'
                                    : stat.label === 'F'
                                      ? 'Failed'
                                      : 'In Progress'
                            }: ${stat.value}`}
                        >
                            {stat.label}:{stat.value}
                        </Caption>
                    ))}
                </Inline>
            )}
        </Inline>
    );
}
