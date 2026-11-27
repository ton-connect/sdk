// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { WalletItem, WalletLabeledItem } from 'src/app/components';
import { mountModal, remoteWallet } from '../views/modals/wallets-modal/harness';

let dispose: (() => void) | undefined;
afterEach(() => dispose?.());

function renderItem(name: string, secondLine?: string): Element {
    const h = mountModal(() => (
        <WalletItem icon="" name={name} secondLine={secondLine} onClick={() => {}} />
    ));
    dispose = h.dispose;
    return h.root.querySelector('[data-tc-wallet-item]')!;
}

function renderedLines(name: string, secondLine?: string): string[] {
    return [...renderItem(name, secondLine).querySelectorAll('div')]
        .filter(el => el.children.length === 0)
        .map(el => el.textContent ?? '');
}

describe('WalletItem name', () => {
    it('drops a bracketed note from the name', () => {
        expect(renderedLines('Walt (ex. Wallet)')).toEqual(['Walt']);
    });

    it('does not show the bracketed note anywhere in the tile', () => {
        expect(renderItem('Walt (ex. Wallet)').textContent).toBe('Walt');
    });

    it('keeps an explicit second line under the shortened name', () => {
        expect(renderedLines('Walt (ex. Wallet)', 'New')).toEqual(['Walt', 'New']);
    });

    it('leaves a plain name on one line', () => {
        expect(renderedLines('Gram Wallet')).toEqual(['Gram Wallet']);
    });
});

describe('WalletLabeledItem', () => {
    it('labels Gram Wallet with its name alone', () => {
        const h = mountModal(() => (
            <WalletLabeledItem wallet={remoteWallet('gramwallet', ['ios'])} onClick={() => {}} />
        ));
        dispose = h.dispose;

        expect(h.root.querySelector('[data-tc-wallet-item]')!.textContent).toBe('gramwallet');
    });

    function renderIcon(
        appName: string,
        layout: 'sheet' | 'dialog',
        besideTelegram = false
    ): Element {
        const h = mountModal(() => (
            <div data-tc-layout={layout}>
                <WalletLabeledItem
                    wallet={remoteWallet(appName, ['ios'])}
                    besideTelegram={besideTelegram}
                    onClick={() => {}}
                />
            </div>
        ));
        dispose = h.dispose;

        return h.root.querySelector('[data-tc-wallet-item] > div')!;
    }

    // On the phone the wallet the lists lead with stands out with a soft glow behind its icon
    it.each([
        ['gramwallet', 'sheet', true],
        ['gramwallet', 'dialog', false],
        ['tonkeeper', 'sheet', false]
    ] as const)('glows behind the icon of %s in the %s layout: %s', (appName, layout, glows) => {
        const boxShadow = getComputedStyle(renderIcon(appName, layout)).boxShadow;
        expect(boxShadow !== '' && boxShadow !== 'none').toBe(glows);
    });

    // Next to Telegram's round icon the glow would make Gram Wallet's stand out of the row
    it('drops the glow behind Gram Wallet beside Telegram', () => {
        const boxShadow = getComputedStyle(renderIcon('gramwallet', 'sheet', true)).boxShadow;
        expect(boxShadow === '' || boxShadow === 'none').toBe(true);
    });

    // So the shine over Telegram's round icon keeps to the circle
    it.each([
        ['telegram', true],
        ['gramwallet', false]
    ])('rounds the icon of %s: %s', (appName, round) => {
        expect(getComputedStyle(renderIcon(appName, 'dialog')).borderRadius === '50%').toBe(round);
    });
});
