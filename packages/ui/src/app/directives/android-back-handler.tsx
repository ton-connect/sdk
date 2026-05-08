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
let nextAndroidBackHandlerId = 1;

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

    // Create a point that the back button can target by pushing a new state into the browser's history stack.
    // Tag the state with a per-instance id so cleanup can verify that the current top-of-history entry
    // is the one this directive instance pushed, not one pushed by a later modal that mounted on top.
    const myId = nextAndroidBackHandlerId++;
    window.history.pushState({ ...ROUTE_STATE, [ROUTE_STATE_ID_KEY]: myId }, '');

    let popstateAlreadyFired = false;

    // Handle the 'popstate' event triggered by the back button press.
    const popstateHandler = (event: PopStateEvent): void => {
        popstateAlreadyFired = true;
        // Prevent the browser's default back navigation,
        event.preventDefault();
        // and instead call a provided function to handle the modal dismissal.
        onClose();
    };
    window.addEventListener('popstate', popstateHandler, { once: true });

    // Clean up when the directive's lifecycle ends
    onCleanup((): void => {
        // Remove the 'popstate' event handler.
        window.removeEventListener('popstate', popstateHandler);

        // If the user already pressed back, our pushed entry has been popped — nothing to clean up.
        if (popstateAlreadyFired) {
            return;
        }

        // Create a macrotask using `requestAnimationFrame()` to ensure that any pending microtasks,
        // such as asynchronous operations from other developers (e.g., tracking wallet connection status
        // and calling `history.pushState()), are completed before we proceed with cleaning up the history state.
        createMacrotask(() => {
            // Only call history.back() if the current top-of-history is the entry WE pushed.
            // If another androidBackHandler instance pushed on top of us, leave history alone —
            // popping it would fire that directive's popstate handler and dismiss the wrong modal.
            if (window.history.state?.[ROUTE_STATE_ID_KEY] === myId) {
                window.history.back();
            }
        });
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
 * Per-instance id key used to distinguish history entries pushed by different
 * directive instances (so cleanup of one modal doesn't pop another modal's entry).
 */
const ROUTE_STATE_ID_KEY = 'androidBackHandlerId';

/**
 * The state for the history entry that is added by this directive.
 */
const ROUTE_STATE = {
    [ROUTE_STATE_KEY]: true
};
