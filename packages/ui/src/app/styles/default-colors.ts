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
        qr: '#FFFFFF'
    },
    text: {
        primary: '#0F0F0F',
        secondary: '#5E6A77'
    }
};

export const defaultDarkColorsSet: ColorsSet = {
    constant: {
        black: '#000000',
        white: '#FFFFFF'
    },
    connectButton: {
        background: '#1EAEFB',
        foreground: '#FFFFFF'
    },
    accent: '#D9E6F2',
    telegramButton: '#1EAEFB',
    icon: {
        primary: '#D9E6F2',
        secondary: '#93A5B8',
        tertiary: '#364459',
        success: '#29CC6A',
        error: '#F5A73B'
    },
    background: {
        primary: '#10161F',
        secondary: '#101B2A',
        segment: '#222C3D',
        tint: '#1D2633',
        qr: '#FFFFFF'
    },
    text: {
        primary: '#FFFFFF',
        secondary: '#93A5B8'
    }
};
