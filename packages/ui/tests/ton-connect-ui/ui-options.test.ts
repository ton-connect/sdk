// @vitest-environment jsdom
import { beforeAll, beforeEach, describe, it, expect, vi } from 'vitest';
import { TonConnect } from '@tonconnect/sdk';

import { TonConnectUI } from 'src/ton-connect-ui';
import { appState, setAppState } from 'src/app/state/app.state';

function createUI(withSecondaryButton?: boolean): TonConnectUI {
    const connector = new TonConnect({
        manifestUrl: 'https://example.com/tonconnect-manifest.json',
        storage: {
            setItem: async () => {},
            getItem: async () => null,
            removeItem: async () => {}
        },
        analytics: { mode: 'off' }
    });
    return new TonConnectUI({
        connector,
        restoreConnection: false,
        uiPreferences: withSecondaryButton === undefined ? undefined : { withSecondaryButton }
    });
}

beforeAll(() => {
    // The wallets list is fetched on construction; no wallet is needed here.
    vi.stubGlobal('fetch', async () => new Response('[]'));
    // jsdom has no matchMedia; the widget reads it for the color scheme.
    window.matchMedia = ((query: string) => ({
        matches: false,
        media: query,
        onchange: null,
        addEventListener: () => {},
        removeEventListener: () => {},
        addListener: () => {},
        removeListener: () => {},
        dispatchEvent: () => false
    })) as typeof window.matchMedia;
});

describe('TonConnectUI.uiOptions: uiPreferences.withSecondaryButton', () => {
    // appState is one store for the whole file, and the tests below turn the option on.
    beforeEach(() => setAppState({ withSecondaryButton: false }));

    it('is off unless the dApp turns it on', () => {
        createUI();

        expect(appState.withSecondaryButton).toBe(false);
    });

    it('survives updates that leave it out', () => {
        const ui = createUI(true);

        ui.uiOptions = { language: 'ru' };
        ui.uiOptions = { uiPreferences: { borderRadius: 's' } };

        expect(appState.withSecondaryButton).toBe(true);
    });

    it('can be turned off again', () => {
        const ui = createUI(true);

        ui.uiOptions = { uiPreferences: { withSecondaryButton: false } };

        expect(appState.withSecondaryButton).toBe(false);
    });
});
