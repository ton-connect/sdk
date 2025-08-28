import { TestCaseStatistic } from '../../../models';
import './GroupStatistic.scss';

type GroupStatisticProps = {
    statistic: TestCaseStatistic;
};

export function GroupStatistic({ statistic }: GroupStatisticProps) {
    const stats = [
        { key: 'passed', label: 'Passed', value: statistic.passed, color: 'green' },
        { key: 'failed', label: 'Failed', value: statistic.failed, color: 'red' },
        { key: 'broken', label: 'Broken', value: statistic.broken, color: 'orange' },
        { key: 'skipped', label: 'Skipped', value: statistic.skipped, color: 'yellow' },
        { key: 'unknown', label: 'Unknown', value: statistic.unknown, color: 'gray' },
        { key: 'inProgress', label: 'In Progress', value: statistic.inProgress, color: 'blue' }
    ];

    const nonZeroStats = stats.filter(stat => stat.value > 0);

    return (
        <div className="group-statistic">
            <div className="group-statistic__total">Total: {statistic.total}</div>
            <div className="group-statistic__details">
                {nonZeroStats.map(stat => (
                    <div
                        key={stat.key}
                        className={`group-statistic__item group-statistic__item--${stat.color}`}
                    >
                        <span className="group-statistic__label">{stat.label}:</span>
                        <span className="group-statistic__value">{stat.value}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}
