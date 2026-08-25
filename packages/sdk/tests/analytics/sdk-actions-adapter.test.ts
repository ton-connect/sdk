import { describe, it, expect } from 'vitest';
import { bindEventsTo } from 'src/analytics/sdk-actions-adapter';
import { EventDispatcher } from 'src/tracker/event-dispatcher';
import { SdkActionEvent, createConnectionInitiatedEvent } from 'src/tracker/types';
import { Analytics } from 'src/analytics/analytics';
import { TonConnectEvent } from 'src/analytics/types';

/**
 * Minimal in-memory dispatcher. `bindEventsTo` registers listeners by their fully-prefixed window
 * event name, and a wrong prefix still type-checks — `AddTonConnectPrefix` admits both
 * `ton-connect-` and `ton-connect-ui-` — so it would fail silently at runtime. Dispatching
 * through a real listener table is what catches that.
 */
function createDispatcher(): EventDispatcher<SdkActionEvent> & {
    emit(eventName: string, detail: unknown): void;
    registered(): string[];
} {
    const listeners = new Map<string, (event: CustomEvent<unknown>) => void>();

    return {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        addEventListener: (async (eventName: string, listener: any) => {
            listeners.set(eventName, listener);
            return () => listeners.delete(eventName);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        }) as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        dispatchEvent: (async () => {}) as any,
        emit(eventName, detail) {
            const listener = listeners.get(eventName);
            if (!listener) {
                throw new Error(`No listener registered for "${eventName}"`);
            }
            listener({ detail } as CustomEvent<unknown>);
        },
        registered: () => [...listeners.keys()]
    };
}

function createAnalytics(): Analytics<TonConnectEvent> & {
    emitted: Array<{ method: string; event: Record<string, unknown> }>;
} {
    const emitted: Array<{ method: string; event: Record<string, unknown> }> = [];

    return new Proxy(
        { emitted },
        {
            get(_target, prop) {
                const name = prop.toString();
                if (name === 'emitted') {
                    return emitted;
                }
                return (event: Record<string, unknown>) => emitted.push({ method: name, event });
            }
        }
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ) as any;
}

const version = { ton_connect_sdk_lib: '4.0.2', ton_connect_ui_lib: null };

describe('analytics/sdk-actions-adapter: connection-initiated', () => {
    it('listens on the core prefix, not the ui prefix', () => {
        const dispatcher = createDispatcher();
        bindEventsTo(dispatcher, createAnalytics());

        expect(dispatcher.registered()).toContain('ton-connect-connection-initiated');
        expect(dispatcher.registered()).not.toContain('ton-connect-ui-connection-initiated');
    });

    it('forwards the source classification to emitConnectionInitiated', () => {
        const dispatcher = createDispatcher();
        const analytics = createAnalytics();
        bindEventsTo(dispatcher, analytics);

        dispatcher.emit(
            'ton-connect-connection-initiated',
            createConnectionInitiatedEvent(
                version,
                { kind: 'js-embedded', jsBridgeKey: 'tonkeeper' },
                'trace-1'
            )
        );

        expect(analytics.emitted).toEqual([
            {
                method: 'emitConnectionInitiated',
                event: {
                    versions: { '@tonconnect/sdk': '4.0.2', '@tonconnect/ui': '' },
                    connection_source_kind: 'js-embedded',
                    js_bridge_key: 'tonkeeper',
                    bridge_url: undefined,
                    trace_id: 'trace-1'
                }
            }
        ]);
    });

    it('carries no wallet identifier for an any-wallet source', () => {
        const dispatcher = createDispatcher();
        const analytics = createAnalytics();
        bindEventsTo(dispatcher, analytics);

        dispatcher.emit(
            'ton-connect-connection-initiated',
            createConnectionInitiatedEvent(version, { kind: 'http-any-wallet' })
        );

        expect(analytics.emitted[0]!.event).toMatchObject({
            connection_source_kind: 'http-any-wallet',
            js_bridge_key: undefined,
            bridge_url: undefined,
            // A missing trace id must arrive as undefined so AnalyticsManager mints one, rather
            // than as null, which would be written to the wire verbatim.
            trace_id: undefined
        });
    });
});
