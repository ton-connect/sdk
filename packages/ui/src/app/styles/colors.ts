import type { Property } from 'csstype';
import { hexToRgb } from 'src/app/utils/css';
type Color = Property.Color;

export type ThemeColors = {
    primary: Color;
    secondary: Color;
    transparentSecondary: Color;
    backgroundSecondary: Color;
    font: {
        primary: Color;
        secondary: Color;
    };
};

export const generateColors = (accentColor: Color): ThemeColors => ({
    primary: accentColor,
    secondary: `rgba(${hexToRgb(accentColor)}, 0.16)`,
    transparentSecondary: 'rgba(122, 137, 153, 0.12)',
    backgroundSecondary: '#EFF1F3',
    font: {
        primary: '#0F0F0F',
        secondary: '#7A8999'
    }
});

export const defaultColors = generateColors('#31A6F5');
