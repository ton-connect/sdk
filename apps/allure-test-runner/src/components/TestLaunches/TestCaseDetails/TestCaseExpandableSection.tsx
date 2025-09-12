import { useState, useRef, useEffect } from 'react';
import { Body, Caption } from '../../ui/typography';

type Props = {
    title: string;
    data?: string;
    dataHtml?: string;
    variant?: 'default' | 'error';
};

export function TestCaseExpandableSection({ title, data, dataHtml, variant = 'default' }: Props) {
    const [isExpanded, setExpanded] = useState(false);
    const [needsExpansion, setNeedsExpansion] = useState(false);
    const contentRef = useRef<HTMLDivElement>(null);

    const toggle = () => setExpanded(value => !value);
    const hasContent = !!(data || dataHtml);

    // Check if content is truncated and needs expansion button
    useEffect(() => {
        if (!hasContent || isExpanded) return;

        const element = contentRef.current;
        if (element) {
            // Check if content is truncated
            setNeedsExpansion(element.scrollHeight > element.clientHeight);
        }
    }, [hasContent, isExpanded, data, dataHtml]);

    const getStyles = () => {
        if (variant === 'error') {
            return {
                border: 'border-red-800/40',
                title: 'text-red-400',
                content: 'text-red-300',
                background: 'bg-red-950/20'
            };
        }
        return {
            border: 'border-border/50',
            title: 'text-muted-foreground',
            content: 'text-foreground',
            background: ''
        };
    };

    const styles = getStyles();

    return (
        <div className="space-y-2">
            <Caption className={`font-medium ${styles.title}`}>{title}:</Caption>
            {hasContent ? (
                <div className={`rounded border ${styles.border} ${styles.background} p-2`}>
                    <div className="relative">
                        <div
                            ref={contentRef}
                            className={`text-sm select-text leading-relaxed ${styles.content} ${
                                !isExpanded ? 'line-clamp-3' : ''
                            } ${!isExpanded && needsExpansion ? 'expandable-content-fade' : ''}`}
                        >
                            {dataHtml ? (
                                <div
                                    className="prose prose-sm max-w-none test-case-content test-details-links"
                                    dangerouslySetInnerHTML={{ __html: dataHtml }}
                                />
                            ) : (
                                <div className="whitespace-pre-wrap test-case-content">{data}</div>
                            )}
                        </div>
                        {needsExpansion && (
                            <button
                                onClick={toggle}
                                className="text-blue-600 text-xs hover:text-blue-700 mt-2 cursor-pointer font-medium"
                            >
                                {isExpanded ? 'Show less' : 'Show more'}
                            </button>
                        )}
                    </div>
                </div>
            ) : (
                <Body className="text-sm text-muted-foreground ml-2">-</Body>
            )}
        </div>
    );
}
