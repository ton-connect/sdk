// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { WalletStatusIcon } from 'src/app/components';
import { setBorderRadius } from 'src/app/state/theme-state';
import { BorderRadius } from 'src/models/border-radius';
import { mountModal } from '../views/modals/wallets-modal/harness';

let dispose: (() => void) | undefined;
afterEach(() => {
    dispose?.();
    setBorderRadius('m');
});

function mount(status: 'waiting' | 'error'): HTMLElement {
    const h = mountModal(() => <WalletStatusIcon src="" status={status} />);
    dispose = h.dispose;
    return h.root;
}

function ring(root: HTMLElement, part: 'track' | 'segment'): Element | null {
    return root.querySelector(`[data-tc-status-ring='${part}']`);
}

describe('WalletStatusIcon ring', () => {
    // Telegram's icon is a circle, so its ring is one too, whatever the corner setting
    it('is round for a round icon', () => {
        const h = mountModal(() => <WalletStatusIcon src="" status="waiting" round />);
        dispose = h.dispose;

        const icon = h.root.querySelector('img')!;
        const track = ring(h.root, 'track')!;
        expect(getComputedStyle(icon).borderRadius).toBe('50%');
        expect(Number(track.getAttribute('rx'))).toBe(Number(track.getAttribute('width')) / 2);
    });

    // The ring follows the icon's outline at a fixed distance: its corners are the icon's corners
    // grown by that distance, so a square icon gets a square ring and a round one a round ring.
    it.each<[BorderRadius, string, string]>([
        ['m', '20px', '27.25'],
        ['s', '14px', '21.25'],
        ['none', '0px', '0']
    ])('is concentric with the icon when borderRadius is %s', (radius, iconCorner, ringCorner) => {
        setBorderRadius(radius);
        const root = mount('waiting');

        const icon = root.querySelector('img')!;
        expect(getComputedStyle(icon).borderRadius).toBe(iconCorner);
        expect(ring(root, 'track')!.getAttribute('rx')).toBe(ringCorner);
        expect(ring(root, 'segment')!.getAttribute('rx')).toBe(ringCorner);
    });

    it('runs a segment round the ring while waiting', () => {
        const root = mount('waiting');

        expect(ring(root, 'segment')).not.toBeNull();
        expect(root.querySelector('svg')!.getAttribute('aria-hidden')).toBe('true');
    });

    it('stops on an error, leaving the whole ring lit, with the badge', () => {
        const root = mount('error');

        expect(ring(root, 'segment')).toBeNull();
        expect(ring(root, 'track')).not.toBeNull();
        expect(root.querySelectorAll('svg').length).toBe(2);
    });
});
