import type { FC, ReactNode } from 'react';

import { cn } from '../../../../../core/utils/cn';

interface SettingsCardProps {
    title: string;
    description?: string;
    children: ReactNode;
    className?: string;
}

export const SettingsCard: FC<SettingsCardProps> = ({
    title,
    description,
    children,
    className
}) => (
    <section
        className={cn(
            'flex flex-col gap-4 rounded-2xl border border-tertiary/60 bg-secondary/50 p-5',
            className
        )}
    >
        <header className="flex flex-col gap-1">
            <h2 className="text-base font-semibold tracking-tight text-foreground">{title}</h2>
            {description ? (
                <p className="text-sm leading-relaxed text-secondary-foreground">{description}</p>
            ) : null}
        </header>
        {children}
    </section>
);
