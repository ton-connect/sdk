// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { Button } from 'src/app/components';
import { buttonBlue } from 'src/app/components/button/style';
import { setTheme, themeState } from 'src/app/state/theme-state';
import { THEME } from 'src/models/THEME';
import { mountModal } from '../views/modals/wallets-modal/harness';

let dispose: (() => void) | undefined;
afterEach(() => {
    dispose?.();
    setTheme(THEME.DARK);
});

function cssColor(value: string): string {
    const probe = document.createElement('div');
    probe.style.color = value;
    return probe.style.color;
}

describe('Button', () => {
    // Label and icon of a default button are the same blue, in both themes
    it('writes the default label in the button blue, like its icon', () => {
        const h = mountModal(() => <Button onClick={() => {}}>Retry</Button>);
        dispose = h.dispose;

        const button = h.root.querySelector('button')!;
        expect(getComputedStyle(button).color).toBe(cssColor(buttonBlue(themeState)));
        expect(getComputedStyle(button).boxShadow).toMatch(/^inset 0 1px 1px 0 /);
    });

    // A darker top line on the light sheet reads as a groove, so there the edge is white
    it('lights the default button from above with white in the light theme', () => {
        setTheme(THEME.LIGHT);
        const h = mountModal(() => <Button onClick={() => {}}>Retry</Button>);
        dispose = h.dispose;

        const shadow = getComputedStyle(h.root.querySelector('button')!).boxShadow;
        expect(shadow).toMatch(/^inset 0 1px 1px 0 rgba\(255, 255, 255, 0\.75\)/);
    });

    // The store banner's Get button: the button blue as a flat tint, with no edge
    it('fills the plain button with a flat blue tint', () => {
        const h = mountModal(() => <Button appearance="plain">Get</Button>);
        dispose = h.dispose;

        const style = getComputedStyle(h.root.querySelector('button')!);
        expect(style.color).toBe(cssColor(buttonBlue(themeState)));
        expect(style.boxShadow).toBe('none');
    });
});
