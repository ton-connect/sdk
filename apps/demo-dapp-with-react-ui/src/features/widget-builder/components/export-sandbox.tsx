import { useMemo, useState } from 'react';

import { Button } from '../../../core/components/ui/button';
import { CopyButton } from '../../../core/components/ui/copy-button';
import { cn } from '../../../core/utils/cn';
import { DEFAULT_TON_CONNECT_SETTINGS } from '../../dev-settings/utils/settings-url';
import { DEFAULT_WIDGET_BUILDER_SETTINGS } from '../utils/widget-builder-settings';
import {
    generateCssSnippet,
    generateJsSnippet,
    generateReactSnippet,
    generateSingleHtmlSnippet
} from '../utils/snippet-generator';

const TONCONNECT_UI_CDN = 'https://unpkg.com/@tonconnect/ui@latest/dist/tonconnect-ui.min.js';

type SnippetType = 'auto' | 'html' | 'css-js' | 'react';

const SNIPPET_TYPES: { value: SnippetType; label: string }[] = [
    { value: 'auto', label: 'Auto' },
    { value: 'html', label: 'Single HTML' },
    { value: 'css-js', label: 'CSS + JS' },
    { value: 'react', label: 'React' }
];

const SAMPLE_SNIPPET = generateSingleHtmlSnippet(
    DEFAULT_TON_CONNECT_SETTINGS,
    DEFAULT_WIDGET_BUILDER_SETTINGS
);

function getSampleSnippet(type: SnippetType): string {
    if (type === 'css-js') {
        return `${generateCssSnippet(DEFAULT_WIDGET_BUILDER_SETTINGS)}

${generateJsSnippet(DEFAULT_TON_CONNECT_SETTINGS, DEFAULT_WIDGET_BUILDER_SETTINGS)}`;
    }

    if (type === 'react') {
        return generateReactSnippet(DEFAULT_TON_CONNECT_SETTINGS, DEFAULT_WIDGET_BUILDER_SETTINGS);
    }

    return SAMPLE_SNIPPET;
}

function getContainerId(snippet: string): string {
    const buttonRootId = snippet.match(/buttonRootId:\s*['"`]([^'"`]+)['"`]/)?.[1];
    const htmlId = snippet.match(/<div\s+id=["']([^"']+)["']/i)?.[1];

    return buttonRootId || htmlId || DEFAULT_WIDGET_BUILDER_SETTINGS.containerId;
}

function buildHtmlFromCssAndJs(snippet: string): string {
    const scriptStart = snippet.search(/(?:const|let|var)\s+tonConnectUI\s*=/);
    const containerId = getContainerId(snippet);
    const css = scriptStart >= 0 ? snippet.slice(0, scriptStart).trim() : snippet.trim();
    const js = scriptStart >= 0 ? snippet.slice(scriptStart).trim() : '';

    return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <script src="${TONCONNECT_UI_CDN}"></script>
    <style>
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        font-family: Inter, system-ui, sans-serif;
        background: #18181a;
      }

      ${css}
    </style>
  </head>
  <body>
    <div id="${containerId}"></div>
    <script>
      ${js}
    </script>
  </body>
</html>`;
}

function getReactHarness(snippet: string): { html: string; error?: string } {
    const manifestUrl = snippet.match(/manifestUrl=["']([^"']+)["']/)?.[1];
    const options = snippet.match(/const\s+tonConnectOptions\s*=\s*([\s\S]*?);\s*\n/)?.[1];
    const css = snippet.match(/\/\* Add this CSS[\s\S]*?\*\/\s*([\s\S]*)$/)?.[1]?.trim() || '';

    if (!manifestUrl || !options) {
        return {
            html: SAMPLE_SNIPPET,
            error: 'Could not find `manifestUrl` and `tonConnectOptions` in the React snippet.'
        };
    }

    return {
        html: `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <script src="${TONCONNECT_UI_CDN}"></script>
    <style>
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        font-family: Inter, system-ui, sans-serif;
        background: #18181a;
      }

      ${css}
    </style>
  </head>
  <body>
    <div id="${DEFAULT_WIDGET_BUILDER_SETTINGS.containerId}"></div>
    <script>
      const tonConnectOptions = ${options};
      const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
        manifestUrl: '${manifestUrl}',
        buttonRootId: '${DEFAULT_WIDGET_BUILDER_SETTINGS.containerId}',
        ...tonConnectOptions
      });
    </script>
  </body>
</html>`
    };
}

function detectSnippetType(snippet: string): Exclude<SnippetType, 'auto'> {
    if (/@tonconnect\/ui-react|TonConnectUIProvider|import\s+/.test(snippet)) {
        return 'react';
    }

    if (/<!doctype html|<html[\s>]/i.test(snippet)) {
        return 'html';
    }

    return 'css-js';
}

function normalizeSnippet(snippet: string, type: SnippetType): { html: string; error?: string } {
    const trimmed = snippet.trim();

    if (!trimmed) {
        return { html: SAMPLE_SNIPPET, error: 'Paste a generated snippet first.' };
    }

    const effectiveType = type === 'auto' ? detectSnippetType(trimmed) : type;

    if (effectiveType === 'react') {
        return getReactHarness(trimmed);
    }

    if (effectiveType === 'html') {
        if (!/<!doctype html|<html[\s>]/i.test(trimmed)) {
            return {
                html: SAMPLE_SNIPPET,
                error: 'Selected Single HTML, but the snippet does not look like a full HTML document.'
            };
        }
        return { html: trimmed };
    }

    return { html: buildHtmlFromCssAndJs(trimmed) };
}

export function ExportSandbox() {
    const [snippetType, setSnippetType] = useState<SnippetType>('auto');
    const [snippet, setSnippet] = useState(SAMPLE_SNIPPET);
    const [renderedSnippet, setRenderedSnippet] = useState(SAMPLE_SNIPPET);
    const [renderedSnippetType, setRenderedSnippetType] = useState<SnippetType>('auto');
    const [error, setError] = useState<string | undefined>();
    const preview = useMemo(
        () => normalizeSnippet(renderedSnippet, renderedSnippetType),
        [renderedSnippet, renderedSnippetType]
    );

    const renderSnippet = () => {
        const next = normalizeSnippet(snippet, snippetType);
        setRenderedSnippet(snippet);
        setRenderedSnippetType(snippetType);
        setError(next.error);
    };

    const selectSnippetType = (type: SnippetType) => {
        const sample = getSampleSnippet(type);
        setSnippetType(type);
        setSnippet(sample);
        setRenderedSnippet(sample);
        setRenderedSnippetType(type);
        setError(undefined);
    };

    const resetSnippet = () => {
        const sample = getSampleSnippet(snippetType);
        setSnippet(sample);
        setRenderedSnippet(sample);
        setRenderedSnippetType(snippetType);
        setError(undefined);
    };

    return (
        <div className="grid h-[calc(100dvh-13rem)] min-h-0 overflow-hidden rounded-3xl border border-tertiary bg-secondary/40 lg:grid-cols-[minmax(0,1fr)_minmax(24rem,0.9fr)]">
            <section className="flex min-h-0 flex-col border-b border-tertiary bg-background lg:border-b-0 lg:border-r">
                <div className="flex items-center justify-between gap-3 border-b border-tertiary p-4">
                    <div>
                        <h2 className="text-lg font-bold text-foreground">Export sandbox</h2>
                        <p className="mt-1 text-sm text-secondary-foreground">
                            Choose a snippet type, paste generated export, and render it in an
                            isolated frame.
                        </p>
                    </div>
                    <CopyButton value={snippet} aria-label="Copy snippet" />
                </div>

                <div className="flex flex-wrap gap-2 border-b border-tertiary p-4">
                    {SNIPPET_TYPES.map(type => (
                        <button
                            key={type.value}
                            type="button"
                            onClick={() => selectSnippetType(type.value)}
                            className={cn(
                                'cursor-pointer rounded-xl px-3 py-2 text-sm font-semibold transition-colors',
                                snippetType === type.value
                                    ? 'bg-primary text-primary-foreground'
                                    : 'bg-tertiary text-foreground hover:bg-background-bezeled'
                            )}
                        >
                            {type.label}
                        </button>
                    ))}
                </div>

                <textarea
                    value={snippet}
                    onChange={event => setSnippet(event.target.value)}
                    spellCheck={false}
                    className={cn(
                        'min-h-0 flex-1 resize-none border-0 bg-transparent p-4 font-mono text-xs leading-5 text-foreground outline-none',
                        'placeholder:text-secondary-foreground'
                    )}
                    placeholder="Paste generated snippet here"
                />

                <div className="flex flex-wrap items-center gap-2 border-t border-tertiary p-4">
                    <Button type="button" size="s" onClick={renderSnippet}>
                        Render snippet
                    </Button>
                    <Button type="button" variant="secondary" size="s" onClick={resetSnippet}>
                        Use sample
                    </Button>
                    {error ? <span className="text-xs text-error">{error}</span> : null}
                </div>
            </section>

            <section className="flex min-h-0 flex-col bg-secondary p-4">
                <div className="mb-3 flex items-center justify-between gap-3">
                    <div>
                        <h2 className="text-sm font-semibold uppercase tracking-wide text-foreground">
                            Preview dapp
                        </h2>
                        <p className="mt-1 text-xs text-secondary-foreground">
                            The iframe loads the pasted export as if it was embedded into a page.
                        </p>
                    </div>
                </div>
                <iframe
                    key={preview.html}
                    title="TON Connect export sandbox"
                    srcDoc={preview.html}
                    sandbox="allow-scripts allow-popups allow-popups-to-escape-sandbox allow-forms"
                    className="min-h-0 flex-1 rounded-2xl border border-tertiary bg-background"
                />
            </section>
        </div>
    );
}
