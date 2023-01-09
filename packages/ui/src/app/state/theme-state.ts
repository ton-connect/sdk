import { createStore } from 'solid-js/store';
import { DefaultTheme } from 'solid-styled-components';
import { THEME } from 'src/models/THEME';
import { defaultDarkColorsSet, defaultLightColorsSet } from 'src/app/styles/default-colors';
import { BorderRadius, PartialColorsSet } from 'src/models';
import { mergeOptions } from 'src/app/utils/options';

export const [themeState, setThemeState] = createStore<DefaultTheme>({
    theme: THEME.LIGHT,
    colors: defaultLightColorsSet,
    borderRadius: 'm'
});

const themeColorsMappingDefault = {
    [THEME.LIGHT]: defaultLightColorsSet,
    [THEME.DARK]: defaultDarkColorsSet
};

const themeCustomColors: Record<THEME, PartialColorsSet | undefined> = {
    [THEME.LIGHT]: undefined,
    [THEME.DARK]: undefined
};

export function setTheme(theme: THEME, colorsSet?: Partial<Record<THEME, PartialColorsSet>>): void {
    if (colorsSet) {
        themeCustomColors[THEME.DARK] = mergeOptions(
            colorsSet[THEME.DARK],
            themeCustomColors[THEME.DARK]
        );
        themeCustomColors[THEME.LIGHT] = mergeOptions(
            colorsSet[THEME.LIGHT],
            themeCustomColors[THEME.LIGHT]
        );
    }

    setThemeState({
        theme,
        colors: mergeOptions(themeCustomColors[theme], themeColorsMappingDefault[theme])
    });
}

export function setBorderRadius(borderRadius: BorderRadius): void {
    setThemeState({ borderRadius });
}

export function setColors(colorsSet: Partial<Record<THEME, PartialColorsSet>>): void {
    themeCustomColors[THEME.DARK] = mergeOptions(
        colorsSet[THEME.DARK],
        themeCustomColors[THEME.DARK]
    );
    themeCustomColors[THEME.LIGHT] = mergeOptions(
        colorsSet[THEME.LIGHT],
        themeCustomColors[THEME.LIGHT]
    );

    setThemeState(state => ({
        colors: mergeOptions(
            themeCustomColors[state.theme as THEME],
            themeColorsMappingDefault[state.theme as THEME]
        )
    }));
}
