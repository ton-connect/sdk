import { THEME, Theme } from 'src/models/THEME';
import { BorderRadius } from 'src/models/border-radius';
import { PartialColorsSet } from 'src/models/colors-set';

/**
 * Visual configuration for SDK-rendered components — theme, border radius,
 * custom palette per theme. Pass on `TonConnectUiOptions.uiPreferences`
 * (constructor or `uiOptions` setter).
 *
 * @example
 * ```ts
 * tonConnectUI.uiOptions = {
 *     uiPreferences: {
 *         theme: THEME.DARK,
 *         borderRadius: 's',
 *         colorsSet: { [THEME.DARK]: { connectButton: { background: '#29CC6A' } } }
 *     }
 * };
 * ```
 */
export interface UIPreferences {
    /**
     * Theme used for SDK UI elements. See {@link Theme} — pass
     * {@link THEME.LIGHT} / {@link THEME.DARK} for a fixed theme or
     * `'SYSTEM'` to follow `prefers-color-scheme`.
     *
     * @default 'SYSTEM'
     */
    theme?: Theme;

    /**
     * Border radius preset applied to buttons, modal corners and tiles.
     * See {@link BorderRadius}.
     *
     * @default 'm'
     */
    borderRadius?: BorderRadius;

    /**
     * Per-theme palette overrides. Each entry is a deep-partial of
     * `ColorsSet`; missing values fall back to the built-in palette.
     */
    colorsSet?: Partial<Record<THEME, PartialColorsSet>>;
}
