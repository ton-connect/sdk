import './Skeleton.scss';

type SkeletonProps = {
    lines?: number;
    type?: 'text' | 'test-case' | 'group-content';
};

export function Skeleton({ lines = 3, type = 'text' }: SkeletonProps) {
    if (type === 'test-case') {
        return (
            <div className="skeleton-test-case">
                <div className="skeleton-test-case__name skeleton-shimmer" />
                <div className="skeleton-test-case__status skeleton-shimmer" />
            </div>
        );
    }

    if (type === 'group-content') {
        return (
            <div className="skeleton-group-content">
                {Array.from({ length: lines }, (_, index) => (
                    <div key={index} className="skeleton-test-case">
                        <div className="skeleton-test-case__name skeleton-shimmer" />
                        <div className="skeleton-test-case__status skeleton-shimmer" />
                    </div>
                ))}
            </div>
        );
    }

    return (
        <div className="skeleton-text">
            {Array.from({ length: lines }, (_, index) => (
                <div
                    key={index}
                    className="skeleton-shimmer skeleton-line"
                    style={{ width: `${Math.random() * 40 + 60}%` }}
                />
            ))}
        </div>
    );
}
