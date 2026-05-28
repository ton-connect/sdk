import { useCallback, useMemo } from 'react';
import { useSearchParams } from 'react-router-dom';

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

const PARAM_KEYS = {
    manifestUrl: 'wbManifest',
    containerId: 'wbContainer',
    buttonLabel: 'wbLabel',
    buttonWidth: 'wbWidth',
    buttonHeight: 'wbHeight',
    buttonFullWidth: 'wbFull',
    cssOverridesEnabled: 'wbCss'
} as const;

const WIDGET_BUILDER_PARAM_KEYS = Object.values(PARAM_KEYS);

function sanitizeId(value: string): string {
    return (
        value.trim().replace(/[^a-zA-Z0-9_-]/g, '') || DEFAULT_WIDGET_BUILDER_SETTINGS.containerId
    );
}

function parseNumber(value: string | null, fallback: number, min: number, max: number): number {
    if (value === null || value.trim() === '') {
        return fallback;
    }
    const parsed = Number(value);
    if (!Number.isFinite(parsed)) {
        return fallback;
    }
    return Math.min(max, Math.max(min, Math.round(parsed)));
}

export function parseWidgetBuilderSettings(params: URLSearchParams): WidgetBuilderSettings {
    return {
        manifestUrl:
            params.get(PARAM_KEYS.manifestUrl)?.trim() ||
            DEFAULT_WIDGET_BUILDER_SETTINGS.manifestUrl,
        containerId: sanitizeId(
            params.get(PARAM_KEYS.containerId) || DEFAULT_WIDGET_BUILDER_SETTINGS.containerId
        ),
        buttonLabel:
            params.get(PARAM_KEYS.buttonLabel)?.trim() ||
            DEFAULT_WIDGET_BUILDER_SETTINGS.buttonLabel,
        buttonWidth: parseNumber(
            params.get(PARAM_KEYS.buttonWidth),
            DEFAULT_WIDGET_BUILDER_SETTINGS.buttonWidth,
            120,
            420
        ),
        buttonHeight: parseNumber(
            params.get(PARAM_KEYS.buttonHeight),
            DEFAULT_WIDGET_BUILDER_SETTINGS.buttonHeight,
            32,
            72
        ),
        buttonFullWidth: params.get(PARAM_KEYS.buttonFullWidth) === '1',
        cssOverridesEnabled: params.get(PARAM_KEYS.cssOverridesEnabled) !== '0'
    };
}

export function writeWidgetBuilderSettingsToSearchParams(
    current: URLSearchParams,
    settings: WidgetBuilderSettings
): Record<string, string> {
    const next = new URLSearchParams(current);

    for (const key of WIDGET_BUILDER_PARAM_KEYS) {
        next.delete(key);
    }

    next.set(PARAM_KEYS.manifestUrl, settings.manifestUrl);
    next.set(PARAM_KEYS.containerId, sanitizeId(settings.containerId));
    next.set(PARAM_KEYS.buttonLabel, settings.buttonLabel);
    next.set(PARAM_KEYS.buttonWidth, String(settings.buttonWidth));
    next.set(PARAM_KEYS.buttonHeight, String(settings.buttonHeight));
    next.set(PARAM_KEYS.buttonFullWidth, settings.buttonFullWidth ? '1' : '0');
    next.set(PARAM_KEYS.cssOverridesEnabled, settings.cssOverridesEnabled ? '1' : '0');

    return Object.fromEntries(next.entries());
}

export function useWidgetBuilderSettings() {
    const [searchParams, setSearchParams] = useSearchParams();
    const settings = useMemo(() => parseWidgetBuilderSettings(searchParams), [searchParams]);

    const setSettings = useCallback(
        (
            patch:
                | Partial<WidgetBuilderSettings>
                | ((prev: WidgetBuilderSettings) => WidgetBuilderSettings)
        ) => {
            setSearchParams(
                prev => {
                    const current = parseWidgetBuilderSettings(prev);
                    const next =
                        typeof patch === 'function' ? patch(current) : { ...current, ...patch };
                    return writeWidgetBuilderSettingsToSearchParams(prev, next);
                },
                { replace: true }
            );
        },
        [setSearchParams]
    );

    const resetSettings = useCallback(() => {
        setSearchParams(
            prev => writeWidgetBuilderSettingsToSearchParams(prev, DEFAULT_WIDGET_BUILDER_SETTINGS),
            { replace: true }
        );
    }, [setSearchParams]);

    return { settings, setSettings, resetSettings };
}
