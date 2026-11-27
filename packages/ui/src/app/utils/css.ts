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

function parseHex(color: string): [number, number, number] | null {
    const match = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i.exec(color);
    if (!match) {
        return null;
    }
    const hex =
        match[1]!.length === 3
            ? match[1]!
                  .split('')
                  .map(c => c + c)
                  .join('')
            : match[1]!;
    return [0, 2, 4].map(i => parseInt(hex.slice(i, i + 2), 16)) as [number, number, number];
}

/**
 * Moves a hex colour towards `target` by `share`, from 0 (the colour) to 1 (the target). A colour
 * that is not in hex is returned as it is.
 */
export function mixColor(color: Color, target: string, share: number): string {
    const from = parseHex(color);
    const to = parseHex(target);
    if (!from || !to) {
        return color;
    }

    return (
        '#' +
        from
            .map((channel, i) => Math.round(channel + (to[i]! - channel) * share))
            .map(channel => channel.toString(16).padStart(2, '0'))
            .join('')
    );
}
