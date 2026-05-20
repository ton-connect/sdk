import type { FC, ReactNode } from 'react';

import { InfoBlock } from '@/core/components/ui/info-block';

interface SectionProps {
    title: string;
    testId: string;
    children: ReactNode;
}

/**
 * Titled `InfoBlock.Container` group. Keeps the Wallet Info page consistent —
 * each section gets the same heading style + box.
 */
export const Section: FC<SectionProps> = ({ title, testId, children }) => (
    <section className="flex flex-col gap-1" data-testid={testId}>
        <h3
            className="text-sm font-semibold uppercase tracking-wide text-secondary-foreground"
            data-testid={`${testId}-title`}
        >
            {title}
        </h3>
        <InfoBlock.Container>{children}</InfoBlock.Container>
    </section>
);
