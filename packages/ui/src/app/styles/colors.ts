import type { Property } from 'csstype';
import { hexToRgb } from 'src/app/utils/css';
type Color = Property.Color;

export type ThemeColors = {
    primary: Color;
    secondary: Color;
    backgroundPrimary: Color;
    backgroundSecondary: Color;
    font: {
        accent: Color;
        primary: Color;
        secondary: Color;
        third: Color;
    };
};

export const generateLightColors = (accentColor: Color): ThemeColors => ({
    primary: accentColor,
    secondary: `rgba(${hexToRgb(accentColor)}, 0.16)`,
    backgroundPrimary: '#FFFFFF',
    backgroundSecondary: '#EFF1F3',
    font: {
        accent: accentColor,
        primary: '#0F0F0F',
        secondary: '#7A8999',
        third: '#7A8999'
    }
});

export const generateDarkColors = (accentColor: Color): ThemeColors => ({
    primary: accentColor,
    secondary: accentColor,
    backgroundPrimary: '#121214',
    backgroundSecondary: '#18181A',
    font: {
        accent: '#E5E5EA',
        primary: '#E5E5EA',
        secondary: '#7D7D85',
        third: '#909099'
    }
});

export const defaultLightColors = generateLightColors('#31A6F5');
export const defaultDarkColors = generateDarkColors('#262629');
