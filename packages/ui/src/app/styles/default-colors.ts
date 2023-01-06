import { ColorsSet } from 'src/models/colors-set';

export const defaultLightColorsSet: ColorsSet = {
    constant: {
        black: '#000000',
        white: '#FFFFFF'
    },
    connectButton: {
        background: '#31A6F5',
        foreground: '#FFFFFF'
    },
    accent: '#31A6F5',
    icon: {
        primary: '#0F0F0F',
        secondary: '#7A8999',
        tertiary: '#C1CAD2',
        success: '#29CC6A'
    },
    background: {
        primary: '#FFFFFF',
        secondary: '#F1F3F5'
    },
    text: {
        primary: '#0F0F0F',
        secondary: '#7A8999',
        subhead: '#6A7785'
    }
};

export const defaultDarkColorsSet: ColorsSet = {
    constant: {
        black: '#000000',
        white: '#FFFFFF'
    },
    connectButton: {
        background: '#31A6F5',
        foreground: '#FFFFFF'
    },
    accent: '#E5E5EA',
    icon: {
        primary: '#E5E5EA',
        secondary: '#909099',
        tertiary: '#434347',
        success: '#29CC6A'
    },
    background: {
        primary: '#121214',
        secondary: '#18181A'
    },
    text: {
        primary: '#E5E5EA',
        secondary: '#7D7D85',
        subhead: '#8C8C93'
    }
};

/*export type ColorsSet = {
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
};*/

/*
export const generateLightColors = (accentColor: Color): ColorsSet => ({
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

export const generateDarkColors = (accentColor: Color): ColorsSet => ({
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
*/
