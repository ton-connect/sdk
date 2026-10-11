export function clamp(value: number, min: number, max: number): number {
    return Math.min(max, Math.max(min, value));
}

export function lerp(from: number, to: number, ratio: number): number {
    return from + (to - from) * ratio;
}
