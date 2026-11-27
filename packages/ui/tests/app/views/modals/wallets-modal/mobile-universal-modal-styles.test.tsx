// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { Button } from 'src/app/components';
import { MobileUniversalModal } from 'src/app/views/modals/wallets-modal/mobile-universal-modal';
import { themeState } from 'src/app/state/theme-state';
import { setAppState } from 'src/app/state/app.state';
import { UIWalletInfo } from 'src/app/models/ui-wallet-info';
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
    setAppState({ withSecondaryButton: false });
});

function cssColor(value: string): string {
    const probe = document.createElement('div');
    probe.style.color = value;
    return probe.style.color;
}

function buttonLabelled(root: HTMLElement, label: string): HTMLButtonElement {
    const button = Array.from(root.querySelectorAll('button')).find(candidate =>
        candidate.textContent?.includes(label)
    );
    if (!button) {
        throw new Error(`No button labelled "${label}"`);
    }
    return button;
}

function mountScreen(isButtonTransparent = false, withSecondaryButton = true): HTMLElement {
    setAppState({ withSecondaryButton });
    const wallet = (appName: string): UIWalletInfo => ({
        ...remoteWallet(appName, ['ios', 'android']),
        isSupportRequiredFeatures: true
    });
    const h = mountModal(() => (
        <MobileUniversalModal
            walletsList={[
                wallet('telegram'),
                { ...wallet('gramwallet'), ui: { isButtonTransparent } },
                wallet('tonkeeper')
            ]}
            additionalRequest={{}}
            walletModalState={OPENED}
            onSelect={() => {}}
            onSelectAllWallets={() => {}}
        />
    ));
    disposers.push(h.dispose);
    return h.root;
}

describe('views/mobile-universal-modal: Telegram button styles', () => {
    it('keeps its own colours and shape when the dApp rendered a small primary button first', () => {
        disposers.push(mountModal(() => <Button scale="s">Connect wallet</Button>).dispose);
        const root = mountScreen();

        const telegram = getComputedStyle(buttonLabelled(root, 'Connect Telegram'));
        expect(telegram.backgroundColor).toBe(cssColor(themeState.colors.telegramButton));
        expect(telegram.color).toBe(cssColor(themeState.colors.constant.white));
        expect(telegram.display).toBe('flex');
        expect(telegram.minHeight).toBe('54px');
    });

    it('stacks Connect Telegram 10px above the Gram Wallet button', () => {
        const root = mountScreen();
        const telegram = getComputedStyle(buttonLabelled(root, 'Connect Telegram'));

        expect(telegram.marginBottom).toBe('10px');
        expect(buttonLabelled(root, 'gramwallet')).toBeTruthy();
    });

    it('fills the Gram Wallet button unless the wallets registry asks for a transparent one', () => {
        const filled = getComputedStyle(buttonLabelled(mountScreen(false), 'gramwallet'));
        const transparent = getComputedStyle(buttonLabelled(mountScreen(true), 'gramwallet'));

        expect(filled.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
        expect(transparent.backgroundColor).toBe('rgba(0, 0, 0, 0)');
    });

    it('keeps the 22px gap under the title above the Gram Wallet button when Telegram is not offered', () => {
        setAppState({ withSecondaryButton: true });
        const wallet = (appName: string, supported = true): UIWalletInfo => ({
            ...remoteWallet(appName, ['ios', 'android']),
            isSupportRequiredFeatures: supported
        });
        const h = mountModal(() => (
            <MobileUniversalModal
                walletsList={[wallet('telegram', false), wallet('gramwallet'), wallet('tonkeeper')]}
                additionalRequest={{}}
                walletModalState={OPENED}
                onSelect={() => {}}
                onSelectAllWallets={() => {}}
            />
        ));
        disposers.push(h.dispose);

        expect(getComputedStyle(buttonLabelled(h.root, 'gramwallet')).marginTop).toBe('18px');
        expect(getComputedStyle(buttonLabelled(mountScreen(), 'gramwallet')).marginTop).toBe('0px');
    });

    it('keeps the same gap under Connect Telegram without the Gram Wallet button', () => {
        const root = mountScreen(false, false);
        const telegram = getComputedStyle(buttonLabelled(root, 'Connect Telegram'));

        expect(telegram.marginBottom).toBe('10px');
    });
});
