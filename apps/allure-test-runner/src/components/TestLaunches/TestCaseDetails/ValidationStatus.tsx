type ValidationStatusProps = {
    isResultValid?: boolean;
    validationErrors: string[];
};

export function ValidationStatus({ isResultValid, validationErrors }: ValidationStatusProps) {
    return (
        <div className="validation-status">
            <div className={`validation-status__indicator ${isResultValid ? 'valid' : 'invalid'}`}>
                {isResultValid ? '✓ VALID' : '✗ NOT VALID'}
            </div>
            {!isResultValid && validationErrors.length > 0 && (
                <div className="validation-errors">
                    <h4 className="validation-errors__title">Validation Errors:</h4>
                    <div className="validation-errors__list">
                        {validationErrors.map((error, index) => (
                            <div key={index} className="validation-errors__item">
                                <span className="validation-errors__icon">⚠️</span>
                                <span className="validation-errors__text">{error}</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}
