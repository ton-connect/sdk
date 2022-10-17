import { createStore } from 'solid-js/store';
import { DefaultTheme } from 'solid-styled-components';
import { THEME } from 'src/app/models/THEME';

export const [themeState, setThemeState] = createStore<DefaultTheme>({
    theme: THEME.LIGHT,
    accentColor: 'blue'
});
