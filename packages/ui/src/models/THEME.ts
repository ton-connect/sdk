/** Two built-in palettes for SDK-rendered UI. */
export enum THEME {
    DARK = 'DARK',
    LIGHT = 'LIGHT'
}

/**
 * Theme identifier accepted by `UIPreferences.theme`. Either one of the
 * built-in {@link THEME} values, or `'SYSTEM'` to follow the user's OS
 * preference via `prefers-color-scheme` (default).
 */
export type Theme = THEME | 'SYSTEM';
