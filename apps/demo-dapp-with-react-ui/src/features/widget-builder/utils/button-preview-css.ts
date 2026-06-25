import { buildConnectButtonCss } from './snippet-generator';
import type { WidgetBuilderSettings } from './widget-builder-settings';

/**
 * The button preview block renders the real TonConnect button inside the preview iframe.
 * These params carry the builder's CSS overrides (width / height / full width) into the
 * iframe query, where they are turned into the exact same CSS the builder exports.
 */
const PARAM_CSS_ENABLED = 'previewButtonCss';
const PARAM_WIDTH = 'previewButtonWidth';
const PARAM_HEIGHT = 'previewButtonHeight';
const PARAM_FULL_WIDTH = 'previewButtonFullWidth';

export function appendButtonPreviewParams(
    params: URLSearchParams,
    builderSettings: WidgetBuilderSettings
): void {
    params.set(PARAM_CSS_ENABLED, builderSettings.cssOverridesEnabled ? '1' : '0');
    params.set(PARAM_WIDTH, String(builderSettings.buttonWidth));
    params.set(PARAM_HEIGHT, String(builderSettings.buttonHeight));
    params.set(PARAM_FULL_WIDTH, builderSettings.buttonFullWidth ? '1' : '0');
}

export function parseButtonPreviewCss(params: URLSearchParams): string {
    if (params.get(PARAM_CSS_ENABLED) !== '1') {
        return '';
    }

    const width = Number(params.get(PARAM_WIDTH));
    const height = Number(params.get(PARAM_HEIGHT));
    const fullWidth = params.get(PARAM_FULL_WIDTH) === '1';

    if (!Number.isFinite(height) || height <= 0) {
        return '';
    }

    if (!fullWidth && (!Number.isFinite(width) || width <= 0)) {
        return '';
    }

    return buildConnectButtonCss({ width, height, fullWidth });
}
