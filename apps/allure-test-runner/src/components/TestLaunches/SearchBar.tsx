type Props = {
    value: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    loading?: boolean;
    onRefresh: () => void;
};

export function SearchBar({ value, onChange, loading, onRefresh }: Props) {
    return (
        <div className="test-runs__controls">
            <div className="test-runs__search-container">
                <input
                    placeholder="Search launches..."
                    value={value}
                    onChange={onChange}
                    className="test-runs__search"
                    disabled={!!loading}
                />
                {loading && <div className="test-runs__search-spinner">🔍</div>}
            </div>
            <button onClick={onRefresh} className="btn btn-secondary">
                Refresh
            </button>
        </div>
    );
}
