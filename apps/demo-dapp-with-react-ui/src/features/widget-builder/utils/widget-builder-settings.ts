export interface WidgetBuilderSettings {
    manifestUrl: string;
    containerId: string;
    buttonLabel: string;
    buttonWidth: number;
    buttonHeight: number;
    buttonFullWidth: boolean;
    cssOverridesEnabled: boolean;
}

export const DEFAULT_WIDGET_BUILDER_SETTINGS: WidgetBuilderSettings = {
    manifestUrl: 'https://ton-connect.github.io/demo-dapp-with-react-ui/tonconnect-manifest.json',
    containerId: 'ton-connect-widget',
    buttonLabel: 'Connect Wallet',
    buttonWidth: 180,
    buttonHeight: 42,
    buttonFullWidth: false,
    cssOverridesEnabled: true
};

function sanitizeId(value: string): string {
    return (
        value.trim().replace(/[^a-zA-Z0-9_-]/g, '') || DEFAULT_WIDGET_BUILDER_SETTINGS.containerId
    );
}

function parseNumber(value: unknown, fallback: number, min: number, max: number): number {
    if (typeof value === 'number' && Number.isFinite(value)) {
        return Math.min(max, Math.max(min, Math.round(value)));
    }

    if (typeof value === 'string') {
        const trimmed = value.trim();

        if (trimmed === '') {
            return fallback;
        }

        const parsed = Number(trimmed);

        if (Number.isFinite(parsed)) {
            return Math.min(max, Math.max(min, Math.round(parsed)));
        }
    }

    return fallback;
}

export function parseWidgetBuilderSettingsFromSearchParams(
    params: URLSearchParams
): WidgetBuilderSettings {
    return normalizeWidgetBuilderSettings({
        manifestUrl: params.get('wbManifest'),
        containerId: params.get('wbContainer'),
        buttonLabel: params.get('wbLabel'),
        buttonWidth: params.get('wbWidth'),
        buttonHeight: params.get('wbHeight'),
        buttonFullWidth: params.get('wbFull') === '1',
        cssOverridesEnabled: params.get('wbCss') !== '0'
    });
}

export function normalizeWidgetBuilderSettings(value: unknown): WidgetBuilderSettings {
    if (!value || typeof value !== 'object') {
        return DEFAULT_WIDGET_BUILDER_SETTINGS;
    }

    const settings = value as Partial<WidgetBuilderSettings>;

    return {
        manifestUrl:
            typeof settings.manifestUrl === 'string' && settings.manifestUrl.trim()
                ? settings.manifestUrl.trim()
                : DEFAULT_WIDGET_BUILDER_SETTINGS.manifestUrl,
        containerId: sanitizeId(
            typeof settings.containerId === 'string'
                ? settings.containerId
                : DEFAULT_WIDGET_BUILDER_SETTINGS.containerId
        ),
        buttonLabel:
            typeof settings.buttonLabel === 'string' && settings.buttonLabel.trim()
                ? settings.buttonLabel.trim()
                : DEFAULT_WIDGET_BUILDER_SETTINGS.buttonLabel,
        buttonWidth: parseNumber(
            settings.buttonWidth,
            DEFAULT_WIDGET_BUILDER_SETTINGS.buttonWidth,
            120,
            420
        ),
        buttonHeight: parseNumber(
            settings.buttonHeight,
            DEFAULT_WIDGET_BUILDER_SETTINGS.buttonHeight,
            32,
            72
        ),
        buttonFullWidth: settings.buttonFullWidth === true,
        cssOverridesEnabled: settings.cssOverridesEnabled !== false
    };
}
