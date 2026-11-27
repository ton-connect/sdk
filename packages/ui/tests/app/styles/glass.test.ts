import { describe, it, expect, afterAll } from 'vitest';
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
});
