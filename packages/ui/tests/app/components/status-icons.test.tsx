// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { ErrorIcon, SuccessIcon } from 'src/app/components';
import { mountModal } from '../views/modals/wallets-modal/harness';

let dispose: (() => void) | undefined;
afterEach(() => dispose?.());

describe('status circles', () => {
    // Lit from above: the circle runs from a lighter shade at the top to a deeper one at the bottom
    it.each([
        ['success', () => <SuccessIcon size="m" fill="#29CC6A" />, '#69db97', '#26bc62'],
        ['error', () => <ErrorIcon size="m" fill="#F5A73B" />, '#f8c176', '#e19a36']
    ])('fills the %s circle with a gradient of its colour', (_, icon, top, bottom) => {
        const h = mountModal(icon);
        dispose = h.dispose;

        const circle = h.root.querySelector('circle')!;
        const id = /^url\(#(.+)\)$/.exec(circle.getAttribute('fill')!)![1]!;
        const stops = [...h.root.querySelectorAll(`[id="${id}"] stop`)];
        expect(stops.map(stop => stop.getAttribute('stop-color'))).toEqual([top, bottom]);
    });

    it('gives every circle its own gradient', () => {
        const h = mountModal(() => (
            <>
                <SuccessIcon size="m" />
                <ErrorIcon size="m" />
            </>
        ));
        dispose = h.dispose;

        const ids = [...h.root.querySelectorAll('linearGradient')].map(g => g.id);
        expect(new Set(ids).size).toBe(2);
    });
});
