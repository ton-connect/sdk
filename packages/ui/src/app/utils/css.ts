import type { Property } from 'csstype';
type Color = Property.Color;

export function hexToRgb(hex: string): string {
    if (hex[0] === '#') {
        hex = hex.slice(1);
    }

    const bigint = parseInt(hex, 16);
    const r = (bigint >> 16) & 255;
    const g = (bigint >> 8) & 255;
    const b = bigint & 255;

    return [r, g, b].join(',');
}

export function rgba(color: Color, opacity: number): string {
    if (color[0] === '#') {
        color = hexToRgb(color);
    }

    return `rgba(${color}, ${opacity})`;
}

export function toPx(value: number | string): string {
    return value.toString() + 'px';
}
