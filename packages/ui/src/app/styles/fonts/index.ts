import latin from './google-sans-latin-wght-normal.woff2';
import cyrillic from './google-sans-cyrillic-wght-normal.woff2';

/**
 * Google Sans, the typeface of the TON site, under its own name so a page that loads another cut of
 * Google Sans keeps it. One variable file per script covers every weight from 400 to 700; it is
 * licensed under the SIL Open Font License 1.1, see `OFL.txt` next to it.
 */
export const FONT_FAMILY = 'TC Google Sans';

const unicodeRanges = {
    latin: 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+0304, U+0308, U+0329, U+2000-206F, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD',
    cyrillic: 'U+0301, U+0400-045F, U+0490-0491, U+04B0-04B1, U+2116'
};

function fontFace(url: string, unicodeRange: string): string {
    return `@font-face {
    font-family: '${FONT_FAMILY}';
    font-style: normal;
    font-weight: 400 700;
    font-display: swap;
    src: url(${url}) format('woff2-variations'), url(${url}) format('woff2');
    unicode-range: ${unicodeRange};
}`;
}

/**
 * Adds the font faces to the page once. They go into a style element of their own rather than the
 * global styles: those are parsed into an object, where a second `@font-face` would replace the
 * first. Characters outside these scripts fall back to the system font.
 */
export function injectFontFaces(): void {
    if (typeof document === 'undefined' || document.querySelector('style[data-tc-fonts]')) {
        return;
    }

    const style = document.createElement('style');
    style.setAttribute('data-tc-fonts', 'true');
    style.textContent = [
        fontFace(latin, unicodeRanges.latin),
        fontFace(cyrillic, unicodeRanges.cyrillic)
    ].join('\n');
    document.head.appendChild(style);
}
