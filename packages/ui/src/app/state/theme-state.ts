import { createStore } from 'solid-js/store';
import { DefaultTheme } from 'solid-styled-components';
import { THEME } from 'src/models/THEME';
import { defaultDarkColors, defaultLightColors } from 'src/app/styles/colors';

export const [themeState, setThemeState] = createStore<DefaultTheme>({
    theme: THEME.LIGHT,
    accentColor: defaultLightColors.primary,
    colors: defaultLightColors
});

export function setTheme(theme: THEME): void {
    if (theme === THEME.LIGHT) {
        setThemeState({
            theme,
            colors: defaultLightColors
        });
    } else {
        setThemeState({
            theme,
            colors: defaultDarkColors
        });
    }
}
