// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { WalletItem } from 'src/app/components';
import { mountModal } from '../views/modals/wallets-modal/harness';

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
