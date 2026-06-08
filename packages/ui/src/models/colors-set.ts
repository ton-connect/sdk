import type { Property } from 'csstype';
type Color = Property.Color;

/**
 * Full palette for one theme — every named slot. Pass as a per-theme entry
 * in `UIPreferences.colorsSet`. The {@link PartialColorsSet} variant is the
 * deep-partial form; missing values fall back to the built-in palette.
 *
 * Color values are any CSS color expression (`#29CC6A`, `rgb(...)`, ...).
 */
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

/** Deep-partial of {@link ColorsSet} — every slot is optional. */
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
