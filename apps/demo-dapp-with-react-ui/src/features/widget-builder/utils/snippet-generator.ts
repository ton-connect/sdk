import type { Theme } from '@tonconnect/ui-react';
import { THEME } from '@tonconnect/ui-react';

import type { TonConnectSettingsState } from '../../dev-settings/utils/settings-url';
import { toTonConnectOptions } from '../../dev-settings/utils/settings-url';
import type { WidgetBuilderSettings } from './widget-builder-settings';

const TONCONNECT_UI_CDN = 'https://unpkg.com/@tonconnect/ui@latest/dist/tonconnect-ui.min.js';

function stringifyConfig(value: unknown): string {
    return JSON.stringify(value, null, 2).replace(/"([^"]+)":/g, '$1:');
}

function getWidgetOptions(tonConnectSettings: TonConnectSettingsState) {
    const { language, uiPreferences, actionsConfiguration, enableAndroidBackHandler } =
        toTonConnectOptions(tonConnectSettings);

    return {
        language,
        uiPreferences,
        actionsConfiguration,
        enableAndroidBackHandler
    };
}

/** Shared between the CSS export and the live button preview, so they never diverge. */
export function buildConnectButtonCss(params: {
    width: number;
    height: number;
    fullWidth: boolean;
}): string {
    const width = params.fullWidth ? '100%' : `${params.width}px`;

    return `[data-tc-connect-button="true"] {
  width: ${width};
  min-width: ${width};
  height: ${params.height}px;
}`;
}

function getButtonCss(builderSettings: WidgetBuilderSettings): string {
    if (!builderSettings.cssOverridesEnabled) {
        return '';
    }

    return buildConnectButtonCss({
        width: builderSettings.buttonWidth,
        height: builderSettings.buttonHeight,
        fullWidth: builderSettings.buttonFullWidth
    });
}

export function generateCssSnippet(builderSettings: WidgetBuilderSettings): string {
    const css = getButtonCss(builderSettings);
    if (!css) {
        return `/* Optional TonConnect UI overrides can go here. */`;
    }
    return css;
}

export function generateJsSnippet(
    tonConnectSettings: TonConnectSettingsState,
    builderSettings: WidgetBuilderSettings
): string {
    const options = stringifyConfig(getWidgetOptions(tonConnectSettings));

    return `const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
  manifestUrl: '${builderSettings.manifestUrl}',
  buttonRootId: '${builderSettings.containerId}',
  ...${options}
});`;
}

export function generateSingleHtmlSnippet(
    tonConnectSettings: TonConnectSettingsState,
    builderSettings: WidgetBuilderSettings
): string {
    const css = generateCssSnippet(builderSettings);
    const js = generateJsSnippet(tonConnectSettings, builderSettings);

    return `<!doctype html>
<html lang="${tonConnectSettings.language}">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>TON Connect Widget</title>
    <script src="${TONCONNECT_UI_CDN}"></script>
    <style>
      body {
        margin: 0;
        min-height: 100vh;
        display: grid;
        place-items: center;
        font-family: Inter, system-ui, sans-serif;
        background: ${tonConnectSettings.theme === THEME.LIGHT ? '#f7f9fb' : '#18181a'};
      }

      ${css
          .split('\n')
          .map(line => line.trimEnd())
          .join('\n      ')}
    </style>
  </head>
  <body>
    <div id="${builderSettings.containerId}"></div>
    <script>
      ${js
          .split('\n')
          .map(line => line.trimEnd())
          .join('\n      ')}
    </script>
  </body>
</html>`;
}

export function generateReactSnippet(
    tonConnectSettings: TonConnectSettingsState,
    builderSettings: WidgetBuilderSettings
): string {
    const options = stringifyConfig(getWidgetOptions(tonConnectSettings));
    const css = generateCssSnippet(builderSettings);
    const theme =
        tonConnectSettings.theme === 'SYSTEM' ? THEME.DARK : (tonConnectSettings.theme as Theme);

    return `import { TonConnectButton, TonConnectUIProvider } from '@tonconnect/ui-react';

const tonConnectOptions = ${options};

export function TonConnectWidget() {
  return (
    <TonConnectUIProvider
      manifestUrl="${builderSettings.manifestUrl}"
      {...tonConnectOptions}
    >
      <div className="ton-connect-widget">
        <TonConnectButton />
      </div>
    </TonConnectUIProvider>
  );
}

/* Add this CSS near the component. Generated for the ${theme} preview. */
${css}`;
}

export function generateCustomLauncherSnippet(
    tonConnectSettings: TonConnectSettingsState,
    builderSettings: WidgetBuilderSettings
): string {
    const options = stringifyConfig(getWidgetOptions(tonConnectSettings));

    return `const tonConnectUI = new TON_CONNECT_UI.TonConnectUI({
  manifestUrl: '${builderSettings.manifestUrl}',
  ...${options}
});

document.querySelector('#${builderSettings.containerId}').addEventListener('click', () => {
  tonConnectUI.openModal();
});`;
}
