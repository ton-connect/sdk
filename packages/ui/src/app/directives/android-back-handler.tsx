import { Accessor, onCleanup } from 'solid-js';
import { getUserAgent } from 'src/app/utils/web-api';

/**
 * A directive that enhances the behavior of modal-like components on Android devices.
 *
 * On Android, users commonly expect the back button to dismiss modals or pop-ups. This directive
 * listens for the 'popstate' event, which is triggered by pressing the back button, and then
 * executes the provided onClose callback to handle the modal dismissal. It also manages the
 * browser history to ensure that the modal's appearance and disappearance correlate with
 * history push and pop actions, respectively.
 *
 * Usage:
 * ```jsx
 * <div use:androidBackHandler={$onCloseCallback}>
 *   ... your modal content ...
 * </div>
 * ```
 */
export default function androidBackHandler(_: Element, accessor: Accessor<() => void>): void {
    const userOSIsAndroid = getUserAgent().os === 'android';
    if (!userOSIsAndroid) {
        return;
    }

    let historyEntryAdded = true;
    window.history.pushState({}, '');

    const popstateHandler = (event: PopStateEvent): void => {
        historyEntryAdded = false;
        event.preventDefault();
        accessor()?.();
    };
    window.addEventListener('popstate', popstateHandler, { once: true });

    onCleanup((): void => {
        window.removeEventListener('popstate', popstateHandler);

        if (historyEntryAdded) {
            historyEntryAdded = false;
            window.history.back();
        }
    });
}

declare module 'solid-js' {
    namespace JSX {
        interface Directives {
            androidBackHandler: () => void;
        }
    }
}
