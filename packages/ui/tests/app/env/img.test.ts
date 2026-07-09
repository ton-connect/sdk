import { describe, it, expect } from 'vitest';
import { IMG } from 'src/app/env/IMG';

describe('IMG brand assets', () => {
    it('ships TON and TG icons as bundled data URIs (CSP-safe, no external host)', () => {
        expect(IMG.TON).toMatch(/^data:image\/png;base64,/);
        expect(IMG.TG).toMatch(/^data:image\/png;base64,/);
    });

    it('data URIs decode to valid PNGs', () => {
        for (const uri of [IMG.TON, IMG.TG]) {
            const base64 = uri.split(',')[1]!;
            const bytes = Buffer.from(base64, 'base64');
            // PNG signature
            expect(bytes.subarray(0, 8)).toEqual(
                Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])
            );
        }
    });
});
