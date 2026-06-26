import { Accessor, onCleanup } from 'solid-js';
import { createMacrotask, getUserAgent } from 'src/app/utils/web-api';

/**
 * A directive that enhances the behavior of modal-like components on Android devices, ensuring
 * a native-like user experience.
 *
 * When enabled, this directive adds a new entry to the browser's history stack, providing a target
 * for the back button press. It then listens for the 'popstate' event, which is triggered when
 * the user presses the back button. In response to the 'popstate' event, the directive calls
 * the provided `onClose` callback to handle the modal dismissal.
 *
 * The functionality can be easily toggled using the isEnabled property.
 *
 * Usage:
 * ```jsx
 * <div use:androidBackHandler={{ isEnabled: true, onClose: () => setIsModalOpen(false) }}>
 *   ... your modal content ...
 * </div>
 * ```
 */

/**
 * Tracks the macrotask scheduled by the previous instance's cleanup so that a
 * subsequent instance can wait for `history.back()` (and its delivered popstate)
 * to finish before pushing its own state. Without this, two modals chained in
 * the same tick (e.g. wallets-modal close → action-modal open) race over a
 * single history entry and the stale `back()` pops the new modal's state.
 */
let pendingCleanup: Promise<void> | null = null;

export default function androidBackHandler(
    _: Element,
    config: Accessor<{
        isEnabled: boolean;
        onClose: () => void;
    }>
): void {
    const { isEnabled, onClose } = config();

    // Terminate the execution if the directive is disabled.
    if (!isEnabled) {
        return;
    }

    // Terminate the execution if the user's device is not Android.
    const userOSIsAndroid = getUserAgent().os === 'android';
    if (!userOSIsAndroid) {
        return;
    }

    let disposed = false;
    let pushed = false;

    // Handle the 'popstate' event triggered by the back button press.
    const popstateHandler = (event: PopStateEvent): void => {
        // Prevent the browser's default back navigation,
        event.preventDefault();
        // and instead call a provided function to handle the modal dismissal.
        onClose();
    };

    const setup = async (): Promise<void> => {
        if (pendingCleanup) {
            try {
                await pendingCleanup;
            } catch {}
        }

        if (disposed) {
            return;
        }

        // Create a point that the back button can target by pushing a new state into the browser's history stack.
        window.history.pushState(ROUTE_STATE, '');
        window.addEventListener('popstate', popstateHandler, { once: true });
        pushed = true;
    };

    void setup();

    // Clean up when the directive's lifecycle ends
    onCleanup((): void => {
        disposed = true;
        // Remove the 'popstate' event handler.
        window.removeEventListener('popstate', popstateHandler);

        // If we never managed to push a state (still waiting on a prior
        // cleanup), there is nothing to roll back at the history level.
        if (!pushed) {
            return;
        }

        // Create a macrotask using `requestAnimationFrame()` to ensure that any pending microtasks,
        // such as asynchronous operations from other developers (e.g., tracking wallet connection status
        // and calling `history.pushState()), are completed before we proceed with cleaning up the history state.
        //
        // `history.back()` dispatches popstate as a separate macrotask. We
        // resolve `pendingCleanup` only after that popstate is delivered to a
        // one-shot consume listener — otherwise the next directive instance
        // could register its own popstate listener in between and accidentally
        // catch our stale event.
        const thisCleanup: Promise<void> = new Promise<void>(resolve => {
            void createMacrotask(() => {
                if (window.history.state?.[ROUTE_STATE_KEY] !== true) {
                    resolve();
                    return;
                }

                // Failsafe: if popstate never arrives (some embedded
                // browsers / TWA contexts can swallow it), don't leave
                // future instances waiting forever. The timeout is long
                // enough to comfortably outlast normal popstate delivery.
                let timer: ReturnType<typeof setTimeout> | null = null;
                const onPopstate = (): void => {
                    if (timer !== null) {
                        clearTimeout(timer);
                    }
                    resolve();
                };
                window.addEventListener('popstate', onPopstate, { once: true });
                timer = setTimeout(() => {
                    window.removeEventListener('popstate', onPopstate);
                    resolve();
                }, POPSTATE_TIMEOUT_MS);
                // navigate back in the browser's history to clean up the state.
                window.history.back();
            });
        }).then(() => {
            if (pendingCleanup === thisCleanup) {
                pendingCleanup = null;
            }
        });
        pendingCleanup = thisCleanup;
    });
}

declare module 'solid-js' {
    namespace JSX {
        interface Directives {
            androidBackHandler: {
                isEnabled: boolean;
                onClose: () => void;
            };
        }
    }
}

/**
 * Unique identifier for the history entry that is added by this directive.
 */
const ROUTE_STATE_KEY = 'androidBackHandler';

/**
 * The state for the history entry that is added by this directive.
 */
const ROUTE_STATE = {
    [ROUTE_STATE_KEY]: true
};

/**
 * Upper bound on how long we wait for popstate after `history.back()`
 * before releasing `pendingCleanup` regardless. Picked to comfortably
 * outlast normal popstate delivery while still unblocking the next modal
 * within one user-perceivable beat if the event is dropped.
 */
const POPSTATE_TIMEOUT_MS = 500;
