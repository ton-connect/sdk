// @vitest-environment jsdom
import { describe, it, expect, afterAll } from 'vitest';
import { css } from 'solid-styled-components';
import { glassSurface } from 'src/app/styles/glass';
import { setTheme, themeState } from 'src/app/state/theme-state';
import { THEME } from 'src/models/THEME';

afterAll(() => setTheme(THEME.DARK));

const themes = [THEME.DARK, THEME.LIGHT];

// All the glass is lit from one place, straight above
describe.each(themes)('glass lighting in the %s theme', theme => {
    it('is lit from above: a thin light edge along the top, and no edge below', () => {
        setTheme(theme);
        const css = glassSurface(themeState);

        expect(css).toMatch(/inset 0 1px 1px 0 /);
        expect(css).not.toMatch(/inset 0 -/);
    });

    // The stylesheet keeps a // comment as text, and it breaks the rule after it
    it('keeps comments out of the CSS', () => {
        setTheme(theme);
        expect(glassSurface(themeState)).not.toContain('//');
    });

    // The denser All wallets sheet has a rule of its own, which outranks a plain one. The solid
    // surface gets one for it too, apart, as a browser without :has() drops a list naming it.
    it('stays solid on the All wallets sheet too for less transparency or more contrast', () => {
        setTheme(theme);
        const className = css`
            ${glassSurface(themeState)}
        `;
        // The rules goober wrote into the page for this theme's solid surface
        const solid = Array.from(document.querySelectorAll('style'))
            .map(style => style.textContent ?? '')
            .join('')
            .split('@media (prefers-reduced-transparency: reduce), (prefers-contrast: more){')
            .find(block => block.startsWith(`.${className}{`))!
            .split('}')
            .filter(Boolean)
            .map(rule => rule.split('{'));
        const base =
            theme === THEME.DARK
                ? themeState.colors.background.tint
                : themeState.colors.background.primary;

        expect(solid).toEqual([
            [
                `.${className}`,
                `background-color:${base};-webkit-backdrop-filter:none;backdrop-filter:none;`
            ],
            [`.${className}:has([data-tc-wallets-modal-list='true'])`, `background-color:${base};`]
        ]);
    });
});
