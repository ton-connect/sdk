import type { Step } from './runner';

function loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
        const s = document.createElement('script');
        s.src = src;
        s.onload = () => resolve();
        s.onerror = () => reject(new Error(`Failed to load ${src}`));
        document.head.appendChild(s);
    });
}

function clearHash(): void {
    history.replaceState(null, '', location.pathname + location.search);
}

export interface Scenario {
    name: string;
    description: string;
    steps: Step[];
}

export const scenarios: Scenario[] = [
    {
        name: 'TC Only',
        description: 'No TMA libraries, only TON Connect',
        steps: [
            { label: 'Load TC', action: () => import('./tc').then(m => m.initTC()) },
            {
                label: 'Diagnostic',
                action: () => import('./diagnostics').then(m => m.renderDiagnostics())
            }
        ]
    },
    {
        name: 'TWA \u2192 TC',
        description: 'telegram-web-app.js loads before TON Connect',
        steps: [
            {
                label: 'Load TWA',
                action: async () => {
                    await loadScript('https://telegram.org/js/telegram-web-app.js');
                    clearHash();
                }
            },
            { label: 'Load TC', action: () => import('./tc').then(m => m.initTC()) },
            {
                label: 'Diagnostic',
                action: () => import('./diagnostics').then(m => m.renderDiagnostics())
            }
        ]
    },
    {
        name: 'TC \u2192 TWA',
        description: 'TON Connect loads before telegram-web-app.js',
        steps: [
            { label: 'Load TC', action: () => import('./tc').then(m => m.initTC()) },
            {
                label: 'Load TWA',
                action: async () => {
                    await loadScript('https://telegram.org/js/telegram-web-app.js');
                    clearHash();
                }
            },
            {
                label: 'Diagnostic',
                action: () => import('./diagnostics').then(m => m.renderDiagnostics())
            }
        ]
    },
    {
        name: 'SDK \u2192 TC',
        description: '@telegram-apps/sdk inits before TON Connect',
        steps: [
            {
                label: 'Load SDK',
                action: async () => {
                    const { init } = await import('@telegram-apps/sdk');
                    try {
                        init();
                    } catch {}
                    clearHash();
                }
            },
            { label: 'Load TC', action: () => import('./tc').then(m => m.initTC()) },
            {
                label: 'Diagnostic',
                action: () => import('./diagnostics').then(m => m.renderDiagnostics())
            }
        ]
    },
    {
        name: 'TC \u2192 SDK',
        description: 'TON Connect loads before @telegram-apps/sdk',
        steps: [
            { label: 'Load TC', action: () => import('./tc').then(m => m.initTC()) },
            {
                label: 'Load SDK',
                action: async () => {
                    const { init } = await import('@telegram-apps/sdk');
                    try {
                        init();
                    } catch {}
                    clearHash();
                }
            },
            {
                label: 'Diagnostic',
                action: () => import('./diagnostics').then(m => m.renderDiagnostics())
            }
        ]
    }
];
