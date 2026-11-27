// @vitest-environment jsdom
import { describe, it, expect, afterEach, beforeEach } from 'vitest';
import { createSignal } from 'solid-js';
import { Modal } from 'src/app/components';
import { mountModal } from '../views/modals/wallets-modal/harness';

// jsdom has no Web Animations: a stand-in whose animations end only when the test says so
let finishAll: () => void;

beforeEach(() => {
    const pending: (() => void)[] = [];
    finishAll = () => pending.splice(0).forEach(finish => finish());
    Object.defineProperty(Element.prototype, 'animate', {
        configurable: true,
        value() {
            return { finished: new Promise<void>(resolve => pending.push(resolve)) };
        }
    });
});

let dispose: (() => void) | undefined;
afterEach(() => {
    dispose?.();
    delete (Element.prototype as { animate?: unknown }).animate;
});

const flush = (): Promise<void> => new Promise(resolve => setTimeout(resolve));

function mount(): { root: HTMLElement; setOpened: (opened: boolean) => void } {
    const [opened, setOpened] = createSignal(true);
    const h = mountModal(() => (
        <Modal opened={opened()} enableAndroidBackHandler={false} onClose={() => {}}>
            <button data-inside="true">Inside</button>
        </Modal>
    ));
    dispose = h.dispose;
    return { root: h.root, setOpened };
}

describe('Modal', () => {
    // It stays on the page until its exit animation ends, but it has been closed
    it('keeps a closing modal out of reach of the keyboard and screen readers', async () => {
        const { root, setOpened } = mount();
        const modal = root.querySelector<HTMLElement>('[data-tc-modal="true"]')!;

        expect(modal.hasAttribute('inert')).toBe(false);

        setOpened(false);
        await flush();

        expect(root.querySelector('[data-tc-modal="true"]')).toBe(modal);
        expect(modal.hasAttribute('inert')).toBe(true);
        expect(modal.style.pointerEvents).toBe('none');

        finishAll();
        await flush();

        expect(root.querySelector('[data-tc-modal="true"]')).toBeNull();
    });

    // So nothing has to take inert off again: a modal opened while the last one leaves is new
    it('opens again as a new modal while the closed one still leaves', async () => {
        const { root, setOpened } = mount();
        const closed = root.querySelector('[data-tc-modal="true"]');

        setOpened(false);
        await flush();
        setOpened(true);
        await flush();

        const modals = Array.from(root.querySelectorAll('[data-tc-modal="true"]'));
        expect(modals).toHaveLength(2);
        const reopened = modals.find(modal => modal !== closed)!;
        expect(reopened.hasAttribute('inert')).toBe(false);

        finishAll();
        await flush();

        expect(Array.from(root.querySelectorAll('[data-tc-modal="true"]'))).toEqual([reopened]);
    });
});
