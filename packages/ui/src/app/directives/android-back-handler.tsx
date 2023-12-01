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
    window.history.pushState(ROUTE_STATE, '');

    // Handle the 'popstate' event triggered by the back button press.
    const popstateHandler = (event: PopStateEvent): void => {
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

        // Create a macrotask using `requestAnimationFrame()` to ensure that any pending microtasks,
        // such as asynchronous operations from other developers (e.g., tracking wallet connection status
        // and calling `history.pushState()), are completed before we proceed with cleaning up the history state.
        createMacrotask(() => {
            // If the current history state is the one that was added by this directive,
            if (window.history.state?.[ROUTE_STATE_KEY] === true) {
                // navigate back in the browser's history to clean up the state.
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
 * The state for the history entry that is added by this directive.
 */
const ROUTE_STATE = {
    [ROUTE_STATE_KEY]: true
};
