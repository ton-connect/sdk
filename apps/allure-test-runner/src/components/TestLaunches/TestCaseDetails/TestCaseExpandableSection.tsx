import { useState } from 'react';

type Props = {
    title: string;
    data?: string;
    dataHtml?: string;
    className?: string;
};

export function TestCaseExpandableSection({ title, data, dataHtml, className }: Props) {
    const [isExpanded, setExpanded] = useState(false);
    const toggle = () => setExpanded(value => !value);

    return (
        <div className="test-case-section">
            <button className="test-case-section-header" onClick={toggle}>
                <h4 className="test-case-section-title">{title}</h4>
                <span className={`test-case-section-toggle ${isExpanded ? 'expanded' : ''}`}></span>
            </button>
            {isExpanded && (
                <div className="test-case-content">
                    <div className={className || 'json-block'}>
                        {dataHtml ? (
                            <div dangerouslySetInnerHTML={{ __html: dataHtml }} />
                        ) : (
                            <code>{data ?? '-'}</code>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}
