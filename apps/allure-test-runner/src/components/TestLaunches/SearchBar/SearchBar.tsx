import { memo } from 'react';

type Props = {
    value: string;
    placeholder?: string;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    loading?: boolean;
    onRefresh: () => void;
};

export const SearchBar = memo(function SearchBar({
    value,
    onChange,
    loading,
    onRefresh,
    placeholder
}: Props) {
    return (
        <div className="test-runs__controls">
            <div className="test-runs__search-container">
                <input
                    placeholder={placeholder || 'Search...'}
                    value={value}
                    onChange={onChange}
                    className="test-runs__search"
                    // disabled={!!loading}
                    autoComplete="off"
                />
                {loading && <div className="test-runs__search-spinner">🔍</div>}
            </div>
            <button onClick={onRefresh} className="btn btn-secondary">
                Refresh
            </button>
        </div>
    );
});
