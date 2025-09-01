import { useState } from 'react';

type Props = {
    title: string;
    data?: string;
    dataHtml?: string;
    className?: string;
};

export function TestCaseExpandableSection({ title, data, dataHtml, className }: Props) {
    const [isExpanded, setExpanded] = useState(true);
    const toggle = () => setExpanded(value => !value);

    // Определяем, является ли контент JSON
    const isJsonContent =
        className === 'transaction-result-json' ||
        (data && data.trim().startsWith('{') && data.trim().endsWith('}'));

    return (
        <div className="test-case-section">
            <button className="test-case-section-header" onClick={toggle}>
                <h4 className="test-case-section-title">{title}</h4>
                <span className={`test-case-section-toggle ${isExpanded ? 'expanded' : ''}`}></span>
            </button>
            {isExpanded && (
                <div className="test-case-content">
                    {dataHtml ? (
                        <div
                            className="plain-text html-content"
                            dangerouslySetInnerHTML={{ __html: dataHtml }}
                        />
                    ) : (
                        <div className={className || (isJsonContent ? 'json-block' : 'text-block')}>
                            {isJsonContent ? (
                                <pre>
                                    <code>{data ?? '-'}</code>
                                </pre>
                            ) : (
                                <div className="plain-text">{data ?? '-'}</div>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
