/**
 * Fixes compatibility issues with external modal libraries that block pointer events
 * on elements outside their content.
 */
export function enableModalInteraction(widgetRootId: string = 'tc-widget-root'): () => void {
    const widgetRoot = document.getElementById(widgetRootId);
    if (!widgetRoot) {
        return () => {};
    }

    const originalPointerEvents = widgetRoot.style.pointerEvents;
    widgetRoot.style.pointerEvents = 'auto';

    const preventDismiss = (event: Event): void => {
        const target = event.target as Node;
        if (widgetRoot.contains(target)) {
            event.stopPropagation();
            event.stopImmediatePropagation();
        }
    };

    const eventTypes = ['pointerdown', 'mousedown', 'touchstart'];
    eventTypes.forEach(eventType => {
        document.addEventListener(eventType, preventDismiss, { capture: true });
    });

    return () => {
        widgetRoot.style.pointerEvents = originalPointerEvents;
        eventTypes.forEach(eventType => {
            document.removeEventListener(eventType, preventDismiss, { capture: true });
        });
    };
}
