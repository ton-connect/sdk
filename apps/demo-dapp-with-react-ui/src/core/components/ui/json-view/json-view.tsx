import { useMemo } from 'react';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-json';

import { cn } from '@/core/lib/utils';

interface JsonViewProps {
    /** Either a JSON string or any value to be JSON.stringify-ed. */
    src: unknown;
    className?: string;
}

export function JsonView({ src, className }: JsonViewProps) {
    const text = useMemo(() => {
        if (typeof src === 'string') return src;
        try {
            return JSON.stringify(src, null, 2);
        } catch {
            return String(src);
        }
    }, [src]);

    const html = useMemo(() => highlight(text, languages.json, 'json'), [text]);

    return (
        <pre
            className={cn(
                'prism-json-editor max-h-[400px] overflow-auto rounded-md border border-tertiary bg-secondary/40 p-3 font-mono text-sm leading-relaxed',
                className
            )}
        >
            <code dangerouslySetInnerHTML={{ __html: html }} />
        </pre>
    );
}
