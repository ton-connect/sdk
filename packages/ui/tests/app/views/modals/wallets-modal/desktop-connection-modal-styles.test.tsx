// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { DesktopConnectionModal } from 'src/app/views/modals/wallets-modal/desktop-connection-modal';
import { setThemeState, themeState } from 'src/app/state/theme-state';
import { mountModal, OPENED, remoteWallet } from './harness';

// jsdom has no named access on window, so goober would give every rule a <style> of its own and
// never dedupe; hand it the single sheet a browser finds, where insertion order decides ties.
Object.assign(window, {
    _goober: Object.assign(document.head.appendChild(document.createElement('style')), {
        id: '_goober',
        innerHTML: ' '
    })
});

// Kept apart from the other modal tests: goober inserts each rule once, so whatever rendered
// earlier in the file decides which of two equally specific rules wins.
const disposers: (() => void)[] = [];
afterEach(() => {
    disposers.splice(0).forEach(dispose => dispose());
    setThemeState({ borderRadius: 'm' });
});

function cssColor(value: string): string {
    const probe = document.createElement('div');
    probe.style.color = value;
    return probe.style.color;
}

function mountAccentButton(
    platforms: Parameters<typeof remoteWallet>[1] = ['ios', 'android', 'macos', 'windows', 'linux']
): HTMLButtonElement {
    const wallet = remoteWallet('telegram', platforms);
    const h = mountModal(() => (
        <DesktopConnectionModal
            wallet={wallet}
            walletsModalState={OPENED}
            selectionSource="manual"
            onBackClick={() => {}}
        />
    ));
    disposers.push(h.dispose);
    return h.root.querySelector<HTMLButtonElement>('[data-tc-connection-accent-button="true"]')!;
}

describe('views/desktop-connection-modal: accent footer button styles', () => {
    it('looks like the Connect Telegram button and hugs its label', () => {
        const button = mountAccentButton();
        const style = getComputedStyle(button);

        expect(style.backgroundColor).toBe(cssColor(themeState.colors.telegramButton));
        expect(style.color).toBe(cssColor(themeState.colors.constant.white));
        expect(style.minHeight).toBe('54px');
        expect(style.borderRadius).toBe('100vh');
        expect(style.width).toBe('auto');
        expect(style.padding).toBe('8px 16px');
        expect(style.maxWidth).toBe('336px');
        expect(style.marginBottom).toBe('24px');
        expect(button.querySelector('path')?.getAttribute('fill')).toBe('currentColor');
    });

    it('keeps the icon in the text flow, so a wrapped label stays centred around it', () => {
        const label = mountAccentButton().querySelector('span')!;

        expect(getComputedStyle(label).display).toBe('block');
        expect(getComputedStyle(label).textAlign).toBe('center');
        expect(getComputedStyle(label.querySelector('svg')!).display).toBe('inline-block');
    });

    it('lowers the laptop 1px below the globe, onto the text baseline', () => {
        const laptop = mountAccentButton().querySelector('svg')!;
        const globe = mountAccentButton(['ios', 'android', 'chrome']).querySelector('svg')!;

        expect(getComputedStyle(laptop).marginTop).toBe('3px');
        expect(getComputedStyle(globe).marginTop).toBe('2px');
    });

    it('drops the rounding when the dApp asks for none', () => {
        setThemeState({ borderRadius: 'none' });
        const style = getComputedStyle(mountAccentButton());

        expect(style.borderRadius).toBe('0');
    });
});
