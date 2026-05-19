import Editor from 'react-simple-code-editor';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-json';

interface RawJsonEditorProps {
    value: string;
    onChange: (value: string) => void;
    syntaxError: boolean;
}

export function RawJsonEditor({ value, onChange, syntaxError }: RawJsonEditorProps) {
    return (
        <>
            <div className="prism-json-editor max-h-[400px] overflow-auto rounded-md border border-tertiary bg-secondary/40">
                <Editor
                    value={value}
                    onValueChange={onChange}
                    highlight={code => highlight(code, languages.json, 'json')}
                    padding={12}
                    textareaClassName="focus:outline-none"
                    style={{
                        fontFamily:
                            'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
                        fontSize: 14,
                        minHeight: 200,
                        lineHeight: 1.625
                    }}
                />
            </div>
            {syntaxError && (
                <div className="rounded-md border border-error/40 bg-error/15 px-3 py-2 text-sm text-error">
                    Invalid JSON syntax. Please fix before sending.
                </div>
            )}
        </>
    );
}
