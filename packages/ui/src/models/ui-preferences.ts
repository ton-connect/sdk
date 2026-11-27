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

    /**
     * Show Gram Wallet as its own button under "Connect Telegram" on the mobile wallets screen.
     * When `false`, Gram Wallet is listed in the wallets row like any other wallet.
     *
     * @default false
     */
    withSecondaryButton?: boolean;

    /**
     * Fold the wallets row of the mobile wallets screen away under the "Connect Telegram" button
     * (and the Gram Wallet button with `withSecondaryButton`). An "Other wallets" button, showing
     * the icons of the row's first wallets, unfolds it in place of the row heading. It only
     * applies when one of those buttons is shown and the row has a wallet to show; otherwise the
     * row is always shown.
     *
     * @default false
     */
    isCompact?: boolean;
}
