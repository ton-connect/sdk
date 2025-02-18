import type { Property } from 'csstype';
type Color = Property.Color;

type DeepPartial<T> = {
    [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

export type ColorsSet = {
    constant: {
        black: Color;
        white: Color;
    };
    connectButton: {
        background: Color;
        foreground: Color;
    };
    accent: Color;
    telegramButton: Color;
    icon: {
        primary: Color;
        secondary: Color;
        tertiary: Color;
        success: Color;
        error: Color;
    };
    background: {
        primary: Color;
        secondary: Color;
        segment: Color;
        tint: Color;
        qr: Color;
    };
    text: {
        primary: Color;
        secondary: Color;
    };
};

export type PartialColorsSet = DeepPartial<ColorsSet>;
