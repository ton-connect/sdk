import type { Property } from 'csstype';
type Color = Property.Color;

export type ThemeColors = {
    primary: Color;
    secondary: Color;
};

export const generateColors = (accentColor: Color): ThemeColors => ({
    primary: accentColor,
    secondary: `rgba(${accentColor}, 0.16)`
});

export const defaultColors = generateColors('#31A6F5');
