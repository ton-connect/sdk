import type { ColorsSet, Theme } from '@tonconnect/ui-react';
import { THEME } from '@tonconnect/ui-react';
// Default palettes come straight from the @tonconnect/ui source
// (resolved by the shared `src/*` alias in vite.config.ts / tsconfig paths),
// so the demo never drifts from the real widget defaults.
import { defaultDarkColorsSet, defaultLightColorsSet } from 'src/app/styles/default-colors';

export const DEFAULT_COLORS_SET: Record<typeof THEME.LIGHT | typeof THEME.DARK, ColorsSet> = {
    [THEME.LIGHT]: defaultLightColorsSet,
    [THEME.DARK]: defaultDarkColorsSet
};

export function getDefaultColorsForTheme(theme: Theme): ColorsSet {
    return theme === THEME.LIGHT ? DEFAULT_COLORS_SET[THEME.LIGHT] : DEFAULT_COLORS_SET[THEME.DARK];
}
