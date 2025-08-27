type Props = {
    title: string;
    isExpanded: boolean;
    onToggle: () => void;
    data: unknown;
    className?: string;
};

export function TestCaseJsonSection({ title, isExpanded, onToggle, data, className }: Props) {
    return (
        <div className="test-case-section">
            <button className="test-case-section-header" onClick={onToggle}>
                <h4 className="test-case-section-title">{title}</h4>
                <span className={`test-case-section-toggle ${isExpanded ? 'expanded' : ''}`}></span>
            </button>
            {isExpanded && (
                <div className="test-case-content">
                    <div className={className || 'json-block'}>
                        <pre>
                            {/*TODO fix function name and NaN in string quotes.*/}
                            {data
                                ? JSON.stringify(
                                      data,
                                      (_, val) => {
                                          if (typeof val === 'function') return val.name;
                                          if (Number.isNaN(val)) return 'NaN';
                                          return val;
                                      },
                                      2
                                  )
                                : '—'}
                        </pre>
                    </div>
                </div>
            )}
        </div>
    );
}
