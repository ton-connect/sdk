// @vitest-environment jsdom
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { setAppState } from 'src/app/state/app.state';
import {
    action,
    Action,
    ActionKind,
    confirmActionNames,
    errorActionNames,
    setAction,
    successActionNames
} from 'src/app/state/modals-state';
import { TonConnectUiContext } from 'src/app/state/ton-connect-ui.context';
import { ActionsModal } from 'src/app/views/modals/actions-modal/actions-modal';
import type { TonConnectUI } from 'src/ton-connect-ui';
import { mountModal } from '../wallets-modal/harness';

vi.mock('src/app/utils/web-api', async importOriginal => ({
    ...(await importOriginal<object>()),
    getUserAgent: () => ({ os: 'android', browser: 'chrome' })
}));

/**
 * Closing the sheet while it waits for the wallet aborts the request, and the wallet goes on
 * showing it. So only an explicit close may do that. A click somewhere on the page or a press of
 * the Android back button must not, and once the wallet has answered there is nothing to abort.
 */
const KINDS: ActionKind[] = ['sendTransaction', 'signData', 'signMessage'];

function sheet(name: Action['name']): Action {
    return { name, openModal: true, showNotification: true, traceId: 'trace-1' } as Action;
}

function isOnScreen(): boolean {
    return document.querySelector('[data-tc-actions-modal-container="true"]') !== null;
}

function clickOutside(): void {
    document.body.click();
}

function clickCloseButton(): void {
    document.querySelector<HTMLElement>('[data-tc-modal] [data-tc-icon-button="true"]')!.click();
}

function pressEscape(): void {
    document.body.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
}

/** The browser pops the top history entry and then tells the page, as for the real button. */
function pressBack(): Promise<void> {
    return new Promise(resolve => {
        window.addEventListener('popstate', () => resolve(), { once: true });
        window.history.back();
    });
}

function hasBackTarget(): boolean {
    return window.history.state?.androidBackHandler === true;
}

let dispose: (() => void) | undefined;

function mount(current: Action): void {
    setAppState({ enableAndroidBackHandler: true });
    setAction(current);
    dispose = mountModal(() => (
        <TonConnectUiContext.Provider value={{ wallet: null } as unknown as TonConnectUI}>
            <ActionsModal />
        </TonConnectUiContext.Provider>
    )).dispose;
}

beforeEach(() => {
    // Something to go back to, so a press the sheet does not handle moves the page instead.
    window.history.pushState({ previousPage: true }, '');
    window.history.pushState({ page: true }, '');
});

afterEach(async () => {
    setAction(null);
    dispose?.();
    dispose = undefined;
    await vi.waitFor(() => expect(hasBackTarget()).toBe(false));
});

describe('views/actions-modal: while a request waits for the wallet', () => {
    it.each(KINDS)('stays open on a click outside it (%s)', kind => {
        mount(sheet(confirmActionNames[kind]));

        clickOutside();

        expect(action()).not.toBeNull();
        expect(isOnScreen()).toBe(true);
    });

    it.each(KINDS)('stays open on the Android back button (%s)', async kind => {
        mount(sheet(confirmActionNames[kind]));

        await pressBack();

        expect(action()).not.toBeNull();
        expect(isOnScreen()).toBe(true);
    });

    it('absorbs one press of the back button and leaves the next to the page', async () => {
        mount(sheet(confirmActionNames.sendTransaction));
        const historyLength = window.history.length;

        await pressBack();

        expect(window.history.state).toEqual({ page: true });
        expect(window.history.length).toBe(historyLength);

        await pressBack();

        expect(window.history.state).toEqual({ previousPage: true });
        expect(action()).not.toBeNull();
        expect(isOnScreen()).toBe(true);
    });

    it.each(KINDS)('closes on the close button (%s)', kind => {
        mount(sheet(confirmActionNames[kind]));

        clickCloseButton();

        expect(action()).toBeNull();
    });

    it.each(KINDS)('closes on Escape (%s)', kind => {
        mount(sheet(confirmActionNames[kind]));

        pressEscape();

        expect(action()).toBeNull();
    });

    it('takes its history entry away when it closes', async () => {
        mount(sheet(confirmActionNames.sendTransaction));
        expect(hasBackTarget()).toBe(true);

        clickCloseButton();

        await vi.waitFor(() => expect(window.history.state).toEqual({ page: true }));
    });

    it('does not move the page when it closes after a press it absorbed', async () => {
        mount(sheet(confirmActionNames.sendTransaction));
        await pressBack();

        clickCloseButton();
        await new Promise(resolve => requestAnimationFrame(resolve));
        await new Promise(resolve => setTimeout(resolve, 50));

        expect(window.history.state).toEqual({ page: true });
    });
});

describe('views/actions-modal: once the wallet has answered', () => {
    const RESULTS = KINDS.flatMap(kind => [successActionNames[kind], errorActionNames[kind]]);

    it.each(RESULTS)('closes on a click outside it (%s)', name => {
        mount(sheet(name));

        clickOutside();

        expect(action()).toBeNull();
    });

    it.each(RESULTS)('closes on the Android back button (%s)', async name => {
        mount(sheet(name));

        await pressBack();

        expect(action()).toBeNull();
    });

    it('closes on a click outside it after waiting', () => {
        mount(sheet(confirmActionNames.sendTransaction));
        clickOutside();
        setAction(sheet(successActionNames.sendTransaction));

        clickOutside();

        expect(action()).toBeNull();
    });

    it('closes on the back button after waiting', async () => {
        mount(sheet(confirmActionNames.sendTransaction));
        setAction(sheet(successActionNames.sendTransaction));

        await pressBack();

        expect(action()).toBeNull();
    });

    it('closes on a click outside it after a press absorbed while waiting', async () => {
        mount(sheet(confirmActionNames.sendTransaction));
        await pressBack();
        setAction(sheet(successActionNames.sendTransaction));

        clickOutside();

        expect(action()).toBeNull();
    });
});
