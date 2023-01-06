import { createStore } from 'solid-js/store';
import { DefaultTheme } from 'solid-styled-components';
import { THEME } from 'src/models/THEME';
import { defaultDarkColorsSet, defaultLightColorsSet } from 'src/app/styles/default-colors';
import { BorderRadius, ColorsSet } from 'src/models';
import { mergeOptions } from 'src/app/utils/options';

export const [themeState, setThemeState] = createStore<DefaultTheme>({
    theme: THEME.LIGHT,
    colors: defaultLightColorsSet,
    borderRadius: 'm'
});

const themeColorsMapping = {
    [THEME.LIGHT]: defaultLightColorsSet,
    [THEME.DARK]: defaultDarkColorsSet
};
export function setTheme(theme: THEME, colorsSet?: Partial<ColorsSet>): void {
    setThemeState({
        theme,
        colors: mergeOptions(colorsSet, themeColorsMapping[theme])
    });
}

export function setBorderRadius(borderRadius: BorderRadius): void {
    setThemeState({ borderRadius });
}
