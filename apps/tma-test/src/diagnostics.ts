interface DebugInfo {
    version: string | null;
    tma: boolean;
    tmaPlatform: string;
    tmaVersion: string | null;
    telegramBrowser: boolean;
    os: string | null;
    browser: string | null;
    rawBrowser: string | null;
    mobile: boolean;
}

const DEFAULTS: DebugInfo = {
    version: null,
    tma: false,
    tmaPlatform: 'unknown',
    tmaVersion: null,
    telegramBrowser: false,
    os: null,
    browser: null,
    rawBrowser: null,
    mobile: false
};

function requestUIDebugInfo(): Promise<DebugInfo> {
    return new Promise(resolve => {
        const timeout = setTimeout(() => resolve(DEFAULTS), 2000);

        window.addEventListener(
            'ton-connect-ui-response-version',
            ((e: CustomEvent) => {
                clearTimeout(timeout);
                const d = e.detail ?? {};
                resolve({
                    version: d.version ?? null,
                    tma: d.tma ?? false,
                    tmaPlatform: d.tmaPlatform ?? 'unknown',
                    tmaVersion: d.tmaVersion ?? null,
                    telegramBrowser: d.telegramBrowser ?? false,
                    os: d.os ?? null,
                    browser: d.browser ?? null,
                    rawBrowser: d.rawBrowser ?? null,
                    mobile: d.mobile ?? false
                });
            }) as EventListener,
            { once: true }
        );

        window.dispatchEvent(new CustomEvent('ton-connect-ui-request-version'));
    });
}

function requestSDKVersion(): Promise<string | null> {
    return new Promise(resolve => {
        const timeout = setTimeout(() => resolve(null), 2000);

        window.addEventListener(
            'ton-connect-response-version',
            ((e: CustomEvent) => {
                clearTimeout(timeout);
                resolve(e.detail?.version ?? null);
            }) as EventListener,
            { once: true }
        );

        window.dispatchEvent(new CustomEvent('ton-connect-request-version'));
    });
}

interface DiagRow {
    label: string;
    value: string;
    expected?: string;
    stacked?: boolean;
}

function val(v: string | null | undefined): string {
    return v || '\u2014';
}

function checkRow(row: DiagRow): boolean {
    if (row.expected === 'detected') return row.value !== '\u2014';
    if (row.expected !== undefined) return row.value === row.expected;
    return true;
}

function esc(s: string): string {
    return s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function renderSection(title: string, rows: DiagRow[]): string {
    const items = rows
        .map(row => {
            const ok = checkRow(row);
            const warn = !ok ? ' diag-warn' : '';
            const hint = !ok ? `<span class="diag-hint">expected ${row.expected}</span>` : '';
            const rowCls = row.stacked ? 'group-row-stacked' : 'group-row';
            return (
                `<div class="${rowCls}${warn}">` +
                `<span class="diag-label">${esc(row.label)}</span>` +
                `<span class="diag-value">${esc(row.value)}${hint}</span>` +
                `</div>`
            );
        })
        .join('');

    return `<div class="section-title">${title}</div><div class="group">${items}</div>`;
}

function renderVerdict(rows: DiagRow[]): string {
    const warnings = rows.filter(r => !checkRow(r)).length;
    if (warnings === 0) {
        return `<div class="verdict verdict-ok">✓ All checks passed</div>`;
    }
    const label = warnings === 1 ? '1 issue detected' : `${warnings} issues detected`;
    return `<div class="verdict verdict-warn">⚠ ${label}</div>`;
}

const STORAGE_KEYS = [
    'tapps/launchParams',
    '__telegram__initParams',
    'ton-connect-session_storage_launchParams'
];

function getStorageRows(): DiagRow[] {
    return STORAGE_KEYS.map(key => ({
        label: key,
        value: sessionStorage.getItem(key) ?? '(none)',
        stacked: true
    }));
}

export async function renderDiagnostics(): Promise<void> {
    const el = document.getElementById('diagnostics');
    if (!el) return;

    const { initialHash } = await import('./app');

    const [tc, sdkVersion] = await Promise.all([requestUIDebugInfo(), requestSDKVersion()]);

    const detection: DiagRow[] = [
        { label: 'Mini App', value: tc.tma ? 'yes' : 'no', expected: 'yes' },
        {
            label: 'Platform',
            value: tc.tmaPlatform !== 'unknown' ? tc.tmaPlatform : '\u2014',
            expected: 'detected'
        },
        { label: 'TMA Version', value: val(tc.tmaVersion), expected: 'detected' },
        { label: 'Telegram Browser', value: tc.telegramBrowser ? 'yes' : 'no' }
    ];

    const environment: DiagRow[] = [
        { label: 'OS', value: val(tc.os), expected: 'detected' },
        { label: 'Browser', value: tc.browser ?? 'unknown' },
        { label: 'User Agent', value: val(tc.rawBrowser) },
        { label: 'Mobile', value: tc.mobile ? 'yes' : 'no' }
    ];

    const versions: DiagRow[] = [
        { label: 'UI', value: val(tc.version), expected: 'detected' },
        { label: 'SDK', value: val(sdkVersion), expected: 'detected' }
    ];

    const hashRows: DiagRow[] = [
        { label: 'Initial #hash', value: initialHash || '(none)', stacked: true },
        { label: 'Current #hash', value: location.hash || '(none)', stacked: true }
    ];

    const allChecked = [...detection, ...environment, ...versions];

    el.innerHTML =
        renderVerdict(allChecked) +
        renderSection('TON Connect detection', detection) +
        renderSection('Environment', environment) +
        renderSection('Versions', versions) +
        renderSection('URL hash', hashRows) +
        renderSection('SessionStorage', getStorageRows());
}
