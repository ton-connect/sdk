import type { FC } from 'react';

import { Section } from './section';
import type { NormalizedFeature } from '../lib/feature-labels';

interface FeaturesSectionProps {
    features: NormalizedFeature[];
}

export const FeaturesSection: FC<FeaturesSectionProps> = ({ features }) => (
    <Section title="Features" testId="wallet-info-features">
        {features.length === 0 ? (
            <p
                className="text-sm text-secondary-foreground"
                data-testid="wallet-info-features-empty"
            >
                The wallet did not advertise any features.
            </p>
        ) : (
            <ul className="flex flex-col gap-2" data-testid="wallet-info-features-list">
                {features.map(feature => (
                    <li
                        key={feature.id}
                        className="flex flex-wrap items-baseline gap-x-2 gap-y-1"
                        data-testid={`wallet-info-features-item-${feature.name}`}
                    >
                        <span className="text-sm font-medium text-foreground">{feature.name}</span>
                        {feature.details.map(detail => (
                            <span
                                key={detail}
                                className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
                            >
                                {detail}
                            </span>
                        ))}
                    </li>
                ))}
            </ul>
        )}
    </Section>
);
