/**
 * iPhone Safari viewport height utility
 * Handles the dynamic viewport height changes when Safari's UI shows/hides
 */

export function setupViewportHeight() {
    // Function to set the viewport height custom property
    const setViewportHeight = () => {
        // Get the actual viewport height
        const vh = window.innerHeight * 0.01;

        // Set the custom property to the root element
        document.documentElement.style.setProperty('--vh', `${vh}px`);
    };

    // Set initial viewport height
    setViewportHeight();

    // Update viewport height on resize (handles Safari UI changes)
    window.addEventListener('resize', setViewportHeight);

    // Update viewport height on orientation change
    window.addEventListener('orientationchange', () => {
        // Small delay to ensure the viewport has adjusted
        setTimeout(setViewportHeight, 100);
    });

    // For iOS Safari, also listen to visual viewport changes if supported
    if ('visualViewport' in window) {
        window.visualViewport?.addEventListener('resize', setViewportHeight);
    }

    // Return cleanup function
    return () => {
        window.removeEventListener('resize', setViewportHeight);
        window.removeEventListener('orientationchange', setViewportHeight);
        if ('visualViewport' in window) {
            window.visualViewport?.removeEventListener('resize', setViewportHeight);
        }
    };
}
