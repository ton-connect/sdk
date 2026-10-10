// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { WalletItem } from 'src/app/components';
import { mountModal } from '../views/modals/wallets-modal/harness';

let dispose: (() => void) | undefined;
afterEach(() => dispose?.());

function renderedLines(name: string, secondLine?: string): string[] {
    const h = mountModal(() => (
        <WalletItem icon="" name={name} secondLine={secondLine} onClick={() => {}} />
    ));
    dispose = h.dispose;
    const item = h.root.querySelector('[data-tc-wallet-item]')!;
    return [...item.querySelectorAll('div')]
        .filter(el => el.children.length === 0)
        .map(el => el.textContent ?? '');
}

describe('WalletItem name', () => {
    it('moves a bracketed note to the second line', () => {
        expect(renderedLines('Walt (ex. Wallet)')).toEqual(['Walt', 'ex. Wallet']);
    });

    it('keeps an explicit second line over the note', () => {
        expect(renderedLines('Walt (ex. Wallet)', 'New')).toEqual(['Walt', 'New']);
    });

    it('leaves a plain name on one line', () => {
        expect(renderedLines('Gram Wallet')).toEqual(['Gram Wallet']);
    });
});
