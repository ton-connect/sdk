// @vitest-environment jsdom
import { describe, it, expect, afterEach } from 'vitest';
import { TonConnectTracker } from 'src/tracker/ton-connect-tracker';
import { BrowserEventDispatcher } from 'src/tracker/browser-event-dispatcher';
import { ConnectionInitiatedEvent } from 'src/tracker/types';

/**
 * Exercises the real dispatch path — tracker -> BrowserEventDispatcher -> window CustomEvent —
 * rather than a stub, because the window event name is assembled by string concatenation
 * (`eventPrefix + eventDetails.type`) and nothing type-checks the result. Every tracker method
 * also swallows its exceptions, so a broken event surfaces only as silence.
 */
function trackerWithListener(): {
    tracker: TonConnectTracker;
    events: CustomEvent<ConnectionInitiatedEvent>[];
    dispose: () => void;
} {
    const events: CustomEvent<ConnectionInitiatedEvent>[] = [];
    const listener = (event: Event): void => {
        events.push(event as CustomEvent<ConnectionInitiatedEvent>);
    };
    window.addEventListener('ton-connect-connection-initiated', listener);

    const tracker = new TonConnectTracker({
        eventDispatcher: new BrowserEventDispatcher(),
        tonConnectSdkVersion: '4.0.2'
    });

    return {
        tracker,
        events,
        dispose: () => window.removeEventListener('ton-connect-connection-initiated', listener)
    };
}

let dispose: (() => void) | undefined;
afterEach(() => dispose?.());

describe('tracker/ton-connect-tracker: trackConnectionInitiated', () => {
    it('dispatches a window event under the core prefix', async () => {
        const harness = trackerWithListener();
        dispose = harness.dispose;

        harness.tracker.trackConnectionInitiated(
            { kind: 'http-specific-wallet', bridgeUrl: 'https://bridge.tonapi.io/bridge' },
            'trace-1'
        );
        // dispatchEvent is async inside the dispatcher; yield once before asserting.
        await Promise.resolve();

        expect(harness.events).toHaveLength(1);
        expect(harness.events[0]!.detail).toEqual({
            type: 'connection-initiated',
            connection_source_kind: 'http-specific-wallet',
            bridge_key: undefined,
            bridge_url: 'https://bridge.tonapi.io/bridge',
            custom_data: { ton_connect_sdk_lib: '4.0.2', ton_connect_ui_lib: null },
            trace_id: 'trace-1'
        });
    });

    it('normalises a missing trace id to null', async () => {
        const harness = trackerWithListener();
        dispose = harness.dispose;

        harness.tracker.trackConnectionInitiated({ kind: 'wallet-connect' });
        await Promise.resolve();

        expect(harness.events[0]!.detail.trace_id).toBeNull();
    });
});
