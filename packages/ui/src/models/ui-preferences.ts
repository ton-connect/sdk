import { THEME, Theme } from 'src/models/THEME';
import { BorderRadius } from 'src/models/border-radius';
import { ColorsSet } from 'src/models/colors-set';

export interface UIPreferences {
    /**
     * Color theme for the UI elements.
     * @default SYSTEM theme.
     */
    theme?: Theme;

    /**
     * Birder radius for UI elements.
     * @default 'm'
     */
    borderRadius?: BorderRadius;

    colorsSet?: Record<THEME, ColorsSet>;
}
