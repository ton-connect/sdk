import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import type { ComponentProps, FC } from 'react';
import 'prismjs/components/prism-json';

import { cn } from '../../../utils/cn';

export interface JsonEditorProps extends Omit<ComponentProps<'div'>, 'onChange'> {
    value: string;
    /** Omit (or pass `readOnly`) for a non-editable view. */
    onChange?: (value: string) => void;
    /** Renders an error border + helper text. Ignored when `readOnly`. */
    invalid?: boolean;
    readOnly?: boolean;
    /** Override the default min-height (240px in edit mode, no min-height in readOnly). */
    minHeight?: number;
}

const FONT_STYLE = {
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    fontSize: 14,
    lineHeight: 1.625
} as const;

export const JsonEditor: FC<JsonEditorProps> = ({
    value,
    onChange,
    invalid = false,
    readOnly = false,
    minHeight,
    className,
    ...props
}) => {
    const showError = invalid && !readOnly;
    const effectiveMinHeight = minHeight ?? (readOnly ? undefined : 240);
    const borderClass = readOnly
        ? ''
        : `border-2 transition-colors focus-within:border-primary ${
              showError ? 'border-error focus-within:border-error' : 'border-transparent'
          }`;

    return (
        <div className={cn('flex flex-col gap-2', className)} {...props}>
            <div
                className={cn(
                    'prism-json-editor max-h-100 overflow-auto rounded-lg bg-secondary',
                    borderClass
                )}
            >
                <Editor
                    value={value}
                    onValueChange={onChange ?? (() => {})}
                    highlight={code => highlight(code, languages.json, 'json')}
                    padding={12}
                    readOnly={readOnly}
                    textareaClassName="focus:outline-none"
                    style={{ ...FONT_STYLE, minHeight: effectiveMinHeight }}
                />
            </div>
            {showError && (
                <div className="rounded-md border border-error/40 bg-error/15 px-3 py-2 text-sm text-error">
                    Invalid JSON syntax. Fix the request before sending.
                </div>
            )}
        </div>
    );
};
