type Props = {
    testId: number | null;
    isSwitching: boolean;
    loading: boolean;
    hasResult: boolean;
};

export function TestCaseStates({ testId, isSwitching, loading, hasResult }: Props) {
    if (!testId) {
        return (
            <div className="test-case-details__empty">
                <div className="test-case-details__empty-icon">📋</div>
                <div className="test-case-details__empty-text">Select a test to view details</div>
            </div>
        );
    }

    if (isSwitching || (loading && !hasResult)) {
        return (
            <div className="test-case-details__loading">
                <div className="test-case-details__loading-spinner"></div>
                <div className="test-case-details__loading-text">Loading test details...</div>
            </div>
        );
    }

    if (!hasResult) {
        return (
            <div className="test-case-details__empty">
                <div className="test-case-details__empty-icon">❌</div>
                <div className="test-case-details__empty-text">No details available</div>
            </div>
        );
    }

    return null;
}
