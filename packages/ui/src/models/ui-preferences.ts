import { THEME, Theme } from 'src/models/THEME';
import { BorderRadius } from 'src/models/border-radius';
import { PartialColorsSet } from 'src/models/colors-set';

export interface UIPreferences {
    /**
     * Color theme for the UI elements. When set to `'SYSTEM'` the theme follows the OS preference.
     * @default 'SYSTEM'
     */
    theme?: Theme;

    /**
     * Border radius for UI elements.
     * @default 'm'
     */
    borderRadius?: BorderRadius;

    /**
     * Configure colors scheme for different themes.
     */
    colorsSet?: Partial<Record<THEME, PartialColorsSet>>;
}
