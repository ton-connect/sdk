import './TreeNavigation.scss';

type TreeNavigationProps = {
    pathHistory: Array<{ id: number; name: string }>;
    onGoToRoot: () => void;
    onGoBack: () => void;
    onNavigateTo: (index: number) => void;
    loading?: boolean;
};

export function TreeNavigation({
    pathHistory,
    onGoToRoot,
    onGoBack,
    onNavigateTo,
    loading = false
}: TreeNavigationProps) {
    if (pathHistory.length === 0) {
        return null;
    }

    return (
        <div className="tree-navigation">
            <button
                className="tree-navigation__item tree-navigation__item--root"
                onClick={onGoToRoot}
                title="Go to root"
            >
                🏠 Root
            </button>

            {pathHistory.map((item, index) => (
                <div key={item.id} className="tree-navigation__segment">
                    <span className="tree-navigation__separator">›</span>
                    <button
                        className="tree-navigation__item"
                        onClick={() => onNavigateTo(index)}
                        title={`Go to ${item.name}`}
                    >
                        {item.name}
                    </button>
                </div>
            ))}

            <button
                className="tree-navigation__back-btn"
                onClick={onGoBack}
                title="Go back"
                disabled={loading}
            >
                {loading ? '⏳' : '←'} Back
            </button>
        </div>
    );
}
