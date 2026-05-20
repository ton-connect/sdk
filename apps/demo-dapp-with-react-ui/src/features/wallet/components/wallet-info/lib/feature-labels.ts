import type { Feature } from '@tonconnect/ui-react';

export interface NormalizedFeature {
    id: string;
    name: string;
    /** Extra metadata to render as small chips (e.g. `max 4`, `types: text, binary`). */
    details: string[];
}

/**
 * Flattens the heterogeneous TonConnect `Feature` array into a list the UI can
 * render uniformly. The deprecated string `'SendTransaction'` becomes a row
 * with no metadata; modern object features expose their fields as `details`.
 */
export const normalizeFeatures = (features: readonly Feature[]): NormalizedFeature[] =>
    features.map((feature, index) => {
        if (typeof feature === 'string') {
            return {
                id: `${feature}-${index}`,
                name: feature,
                details: ['legacy descriptor']
            };
        }

        const details: string[] = [];
        if ('maxMessages' in feature) details.push(`max ${feature.maxMessages} messages`);
        if ('extraCurrencySupported' in feature && feature.extraCurrencySupported) {
            details.push('extra currency');
        }
        if ('itemTypes' in feature && feature.itemTypes?.length) {
            details.push(`items: ${feature.itemTypes.join(', ')}`);
        }
        if ('types' in feature && feature.types?.length) {
            details.push(`types: ${feature.types.join(', ')}`);
        }

        return {
            id: `${feature.name}-${index}`,
            name: feature.name,
            details
        };
    });
