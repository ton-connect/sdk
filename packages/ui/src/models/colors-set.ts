import type { Property } from 'csstype';
type Color = Property.Color;

/** Complete set of colour tokens used to theme the TonConnectUI widget. */
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

/** Partial colour token override — only the provided tokens are applied; the rest fall back to defaults. */
export type PartialColorsSet = {
    constant?: {
        black?: Color;
        white?: Color;
    };
    connectButton?: {
        background?: Color;
        foreground?: Color;
    };
    accent?: Color;
    telegramButton?: Color;
    icon?: {
        primary?: Color;
        secondary?: Color;
        tertiary?: Color;
        success?: Color;
        error?: Color;
    };
    background?: {
        primary?: Color;
        secondary?: Color;
        segment?: Color;
        tint?: Color;
        qr?: Color;
    };
    text?: {
        primary?: Color;
        secondary?: Color;
    };
};
