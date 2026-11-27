// @vitest-environment jsdom
import { beforeAll, beforeEach, describe, it, expect, vi } from 'vitest';
import { TonConnect } from '@tonconnect/sdk';

import { TonConnectUI } from 'src/ton-connect-ui';
import { appState, setAppState } from 'src/app/state/app.state';
import { UIPreferences } from 'src/models/ui-preferences';

function createUI(uiPreferences?: UIPreferences): TonConnectUI {
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
        uiPreferences
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

describe.each(['withSecondaryButton', 'isCompact'] as const)(
    'TonConnectUI.uiOptions: uiPreferences.%s',
    option => {
        // appState is one store for the whole file, and the tests below turn the option on.
        beforeEach(() => setAppState({ [option]: false }));

        it('is off unless the dApp turns it on', () => {
            createUI();

            expect(appState[option]).toBe(false);
        });

        it('survives updates that leave it out', () => {
            const ui = createUI({ [option]: true });

            ui.uiOptions = { language: 'ru' };
            ui.uiOptions = { uiPreferences: { borderRadius: 's' } };

            expect(appState[option]).toBe(true);
        });

        it('can be turned off again', () => {
            const ui = createUI({ [option]: true });

            ui.uiOptions = { uiPreferences: { [option]: false } };

            expect(appState[option]).toBe(false);
        });
    }
);
