// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { IconButton } from 'src/app/components';
import { setTheme, themeState } from 'src/app/state/theme-state';
import { THEME } from 'src/models/THEME';
import { rgba } from 'src/app/utils/css';
import { mountModal } from '../views/modals/wallets-modal/harness';

let dispose: (() => void) | undefined;
afterEach(() => {
    dispose?.();
    setTheme(THEME.DARK);
});

function iconFill(icon: 'close' | 'arrow', fill?: string): string | null {
    const h = mountModal(() => <IconButton icon={icon} fill={fill} onClick={() => {}} />);
    dispose = h.dispose;
    // The close icon is a filled outline, the back chevron a stroke
    const path = h.root.querySelector('path')!;
    return path.getAttribute('stroke') ?? path.getAttribute('fill');
}

describe('IconButton icon', () => {
    // The round buttons at the top carry their icons in the text colour: black or white, not grey
    it.each(['close', 'arrow'] as const)('draws the %s icon in the primary text colour', icon => {
        expect(iconFill(icon)).toBe(themeState.colors.text.primary);
    });

    it('keeps a fill it is given', () => {
        expect(iconFill('close', '#ff0000')).toBe('#ff0000');
    });
});

describe('IconButton fill', () => {
    // A pill of the TON site: a translucent surface lighter than the sheet in both themes, with a
    // thin light edge on top
    it.each([
        [THEME.LIGHT, () => 'rgba(255, 255, 255, 0.32)'],
        [THEME.DARK, () => rgba(themeState.colors.icon.secondary, 0.14)]
    ])('is a translucent pill lit from above in the %s theme', (theme, fill) => {
        setTheme(theme);
        const h = mountModal(() => <IconButton icon="close" onClick={() => {}} />);
        dispose = h.dispose;

        const probe = document.createElement('div');
        probe.style.backgroundColor = fill();
        const style = getComputedStyle(h.root.querySelector('button')!);
        expect(style.backgroundColor).toBe(probe.style.backgroundColor);
        expect(style.boxShadow).toMatch(/^inset 0 1px 1px 0 /);
    });
});
