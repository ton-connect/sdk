import { describe, it, expect } from 'vitest';
import { mixColor } from 'src/app/utils/css';

describe('mixColor', () => {
    it('moves a hex colour towards another by the given share', () => {
        expect(mixColor('#29CC6A', '#ffffff', 0.5)).toBe('#94e6b5');
        expect(mixColor('#29CC6A', '#000000', 0.5)).toBe('#156635');
    });

    it('keeps the colour at no share and reaches the target at a full one', () => {
        expect(mixColor('#F5A73B', '#ffffff', 0)).toBe('#f5a73b');
        expect(mixColor('#F5A73B', '#000000', 1)).toBe('#000000');
    });

    it('reads three-digit hex colours', () => {
        expect(mixColor('#fff', '#000000', 0.5)).toBe('#808080');
    });

    it('leaves a colour it cannot read as it is', () => {
        expect(mixColor('rgb(1, 2, 3)', '#ffffff', 0.5)).toBe('rgb(1, 2, 3)');
        expect(mixColor('red', '#ffffff', 0.5)).toBe('red');
    });
});
