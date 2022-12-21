import { createStore } from 'solid-js/store';
import { DefaultTheme } from 'solid-styled-components';
import { defaultColors } from 'src/app/styles/colors';
import { THEME } from 'src/models/THEME';

export const [themeState, setThemeState] = createStore<DefaultTheme>({
    theme: THEME.LIGHT,
    accentColor: defaultColors.primary,
    colors: defaultColors
});
