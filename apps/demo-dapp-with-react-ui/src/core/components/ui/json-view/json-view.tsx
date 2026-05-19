import { useMemo } from 'react';
import type { ComponentProps } from 'react';

import { JsonEditor } from '@/core/components/ui/json-editor';

interface JsonViewProps extends Omit<ComponentProps<'div'>, 'onChange'> {
    /** Either a JSON string or any value to be JSON.stringify-ed. */
    src: unknown;
}

export const JsonView = ({ src, ...props }: JsonViewProps) => {
    const text = useMemo(() => {
        if (typeof src === 'string') return src;
        try {
            return JSON.stringify(src, null, 2);
        } catch {
            return String(src);
        }
    }, [src]);

    return <JsonEditor value={text} readOnly {...props} />;
};
