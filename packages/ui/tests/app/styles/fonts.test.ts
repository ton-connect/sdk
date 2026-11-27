// @vitest-environment jsdom
import { describe, it, expect } from 'vitest';
import { FONT_FAMILY, injectFontFaces } from 'src/app/styles/fonts';

describe('injectFontFaces', () => {
    it('adds the Latin and Cyrillic faces of the bundled font once', () => {
        injectFontFaces();
        injectFontFaces();

        const styles = document.querySelectorAll('style[data-tc-fonts]');
        expect(styles.length).toBe(1);

        const css = styles[0]!.textContent!;
        expect(css.match(/@font-face/g)?.length).toBe(2);
        expect(css).toContain(`font-family: '${FONT_FAMILY}'`);
        expect(css).toContain('font-weight: 400 700');
        expect(css).toContain('U+0400-045F');
    });
});
