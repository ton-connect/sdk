import type { Property } from 'csstype';
import { hexToRgb } from 'src/app/utils/css';
type Color = Property.Color;

export type ThemeColors = {
    primary: Color;
    secondary: Color;
    transparentSecondary: Color;
};

export const generateColors = (accentColor: Color): ThemeColors => ({
    primary: accentColor,
    secondary: `rgba(${hexToRgb(accentColor)}, 0.16)`,
    transparentSecondary: 'rgba(122, 137, 153, 0.12)'
});

export const defaultColors = generateColors('#31A6F5');
