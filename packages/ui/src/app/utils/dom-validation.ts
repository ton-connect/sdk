/**
 * Utility functions for DOM validation in TON Connect UI
 */

/**
 * Checks if the TON Connect widget root element exists in the DOM
 * @param rootId - The ID of the root element to check
 * @returns true if the element exists, false otherwise
 */
export function checkWidgetRootExists(rootId: string): boolean {
    const element = document.getElementById(rootId);
    return element !== null;
}

export function logWidgetRootMissingError(rootId: string): void {
    console.error(`[TON Connect UI] CRITICAL ERROR: Widget root element not found!`);
    console.error(`[TON Connect UI] The element with ID "${rootId}" was not found in the DOM.`);
}

/**
 * Validates that the widget root element exists and logs an error if it doesn't
 * @param rootId - The ID of the root element to validate
 * @returns true if the element exists, false otherwise
 */
export function validateWidgetRoot(rootId: string): boolean {
    const exists = checkWidgetRootExists(rootId);
    if (!exists) {
        logWidgetRootMissingError(rootId);
    }
    return exists;
}
