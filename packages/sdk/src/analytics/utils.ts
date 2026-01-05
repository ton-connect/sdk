/**
 * Converts a PascalCase (or camelCase) string to kebab-case.
 *
 * For example:
 * - "PascalCase" → "pascal-case"
 * - "camelCaseExample" → "camel-case-example"
 *
 * @param value - The input string in PascalCase or camelCase format.
 * @returns The converted kebab-case string.
 */
export function pascalToKebab(value: string): string {
    return value.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
}

/**
 * Network Information API interface (not available in all browsers)
 */
interface NetworkInformation {
    rtt?: number;
    effectiveType?: string;
    type?: string;
}

/**
 * Extended Navigator interface with Network Information API
 */
interface NavigatorWithConnection extends Navigator {
    connection?: NetworkInformation;
    mozConnection?: NetworkInformation;
    webkitConnection?: NetworkInformation;
}

/**
 * Collects static connection metrics from the browser's Performance API.
 * TTFB is measured once at page load and doesn't change.
 * @returns An object containing static connection metrics (TTFB) or empty object if not available.
 */
export function getStaticConnectionMetrics(): {
    conn_ttfb?: number;
} {
    const metrics: {
        conn_ttfb?: number;
    } = {};

    // Get TTFB from Navigation Timing API (static, measured once at page load)
    try {
        const navEntries = performance.getEntriesByType('navigation');
        if (navEntries.length > 0) {
            const nav = navEntries[0] as PerformanceNavigationTiming;
            if (nav.responseStart && nav.requestStart) {
                metrics.conn_ttfb = Math.round(nav.responseStart - nav.requestStart);
            }
        }
    } catch (e) {
        // Performance API not available or error occurred
    }

    return Object.keys(metrics).length > 0 ? metrics : {};
}

/**
 * Collects dynamic connection metrics from the browser's Network Information API.
 * RTT and network type can change over time, so they should be measured at the time of event emission.
 * @returns An object containing dynamic connection metrics (RTT, network type) or empty object if not available.
 */
export function getDynamicConnectionMetrics(): {
    conn_rtt?: number;
    conn_network_type?: string;
} {
    const metrics: {
        conn_rtt?: number;
        conn_network_type?: string;
    } = {};

    // Get RTT and network type from Network Information API (dynamic, can change)
    try {
        const navigatorWithConnection = navigator as NavigatorWithConnection;
        const connection =
            navigatorWithConnection.connection ||
            navigatorWithConnection.mozConnection ||
            navigatorWithConnection.webkitConnection;
        if (connection) {
            if (connection.rtt !== undefined) {
                metrics.conn_rtt = connection.rtt;
            }
            if (connection.effectiveType) {
                metrics.conn_network_type = connection.effectiveType;
            } else if (connection.type) {
                metrics.conn_network_type = connection.type;
            }
        }
    } catch (e) {
        // Network Information API not available or error occurred
    }

    return Object.keys(metrics).length > 0 ? metrics : {};
}

/**
 * Collects all connection metrics (both static and dynamic).
 * @deprecated Use getStaticConnectionMetrics() and getDynamicConnectionMetrics() separately.
 * @returns An object containing connection metrics (TTFB, RTT, network type) or empty object if not available.
 */
export function getConnectionMetrics(): {
    conn_ttfb?: number;
    conn_rtt?: number;
    conn_network_type?: string;
} {
    return {
        ...getStaticConnectionMetrics(),
        ...getDynamicConnectionMetrics()
    };
}
