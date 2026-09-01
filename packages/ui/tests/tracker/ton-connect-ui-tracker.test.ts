// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import {
    BrowserEventDispatcher,
    WalletPreselectedEvent,
    WalletSelectedEvent
} from '@tonconnect/sdk';
import { TonConnectUITracker } from 'src/tracker/ton-connect-ui-tracker';

/**
 * Exercises the real dispatch path — tracker -> BrowserEventDispatcher -> window CustomEvent —
 * rather than a stub, because the window event name is assembled by string concatenation
 * (`eventPrefix + eventDetails.type`) and nothing type-checks the result. These two events must
 * carry the `ton-connect-ui-` prefix: the analytics adapter listens for exactly that, and the
 * core-prefixed name would type-check while silently never firing.
 *
 * Every tracker method also swallows its exceptions, so a broken event surfaces only as silence.
 */
function harness<T>(eventName: string): {
    tracker: TonConnectUITracker;
    events: CustomEvent<T>[];
    dispose: () => void;
} {
    const events: CustomEvent<T>[] = [];
    const listener = (event: Event): void => void events.push(event as CustomEvent<T>);
    window.addEventListener(eventName, listener);

    const tracker = new TonConnectUITracker({
        eventDispatcher: new BrowserEventDispatcher(),
        tonConnectUiVersion: '3.0.2'
    });

    return { tracker, events, dispose: () => window.removeEventListener(eventName, listener) };
}

let dispose: (() => void) | undefined;
afterEach(() => dispose?.());

describe('tracker/ton-connect-ui-tracker: trackWalletPreselected', () => {
    it('dispatches under the ui prefix with every field supplied by the caller', async () => {
        const h = harness<WalletPreselectedEvent>('ton-connect-ui-wallet-preselected');
        dispose = h.dispose;

        h.tracker.trackWalletPreselected('tonkeeper', 'universal-modal', 'manual', 'trace-1');
        await Promise.resolve();

        expect(h.events).toHaveLength(1);
        expect(h.events[0]!.detail).toEqual({
            type: 'wallet-preselected',
            wallet_app_name: 'tonkeeper',
            surface: 'universal-modal',
            selection_source: 'manual',
            custom_data: { ton_connect_sdk_lib: null, ton_connect_ui_lib: '3.0.2' },
            trace_id: 'trace-1'
        });
    });
});

describe('tracker/ton-connect-ui-tracker: trackWalletSelected', () => {
    it('carries the desktop transport choice', async () => {
        const h = harness<WalletSelectedEvent>('ton-connect-ui-wallet-selected');
        dispose = h.dispose;

        h.tracker.trackWalletSelected(
            'mytonwallet',
            'connection-modal',
            'manual',
            'trace-2',
            'extension'
        );
        await Promise.resolve();

        expect(h.events[0]!.detail).toMatchObject({
            type: 'wallet-selected',
            wallet_app_name: 'mytonwallet',
            surface: 'connection-modal',
            selection_source: 'manual',
            connection_mode: 'extension',
            trace_id: 'trace-2'
        });
    });

    it('omits the transport where the concept does not apply', async () => {
        const h = harness<WalletSelectedEvent>('ton-connect-ui-wallet-selected');
        dispose = h.dispose;

        h.tracker.trackWalletSelected('tonkeeper', 'embedded', 'auto-embedded', 'trace-3');
        await Promise.resolve();

        expect(h.events[0]!.detail.connection_mode).toBeUndefined();
        expect(h.events[0]!.detail.selection_source).toBe('auto-embedded');
    });
});
