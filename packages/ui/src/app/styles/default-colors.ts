import { ColorsSet } from 'src/models/colors-set';

export const defaultLightColorsSet: ColorsSet = {
    constant: {
        black: '#000000',
        white: '#FFFFFF'
    },
    connectButton: {
        background: '#0098EA',
        foreground: '#FFFFFF'
    },
    accent: '#0098EA',
    telegramButton: '#0098EA',
    icon: {
        primary: '#0F0F0F',
        secondary: '#7A8999',
        tertiary: '#C1CAD2',
        success: '#29CC6A',
        error: '#F5A73B'
    },
    background: {
        primary: '#FFFFFF',
        secondary: '#F1F3F5',
        segment: '#FFFFFF',
        tint: '#F1F3F5',
        qr: '#F1F3F5'
    },
    text: {
        primary: '#0F0F0F',
        secondary: '#6A7785'
    }
};

export const defaultDarkColorsSet: ColorsSet = {
    constant: {
        black: '#000000',
        white: '#FFFFFF'
    },
    connectButton: {
        background: '#0098EA',
        foreground: '#FFFFFF'
    },
    accent: '#E5E5EA',
    telegramButton: '#31A6F5',
    icon: {
        primary: '#E5E5EA',
        secondary: '#909099',
        tertiary: '#434347',
        success: '#29CC6A',
        error: '#F5A73B'
    },
    background: {
        primary: '#121214',
        secondary: '#18181A',
        segment: '#262629',
        tint: '#222224',
        qr: '#FFFFFF'
    },
    text: {
        primary: '#E5E5EA',
        secondary: '#7D7D85'
    }
};
