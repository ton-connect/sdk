import type { FC, ReactNode } from 'react';

import { cn } from '../../lib/utils';

interface ResultPanelProps {
    title: string;
    /** Optional trailing element rendered to the right of the title (e.g. copy button). */
    action?: ReactNode;
    children: ReactNode;
    className?: string;
}

export const ResultPanel: FC<ResultPanelProps> = ({ title, action, children, className }) => {
    return (
        <div className={cn('flex w-full flex-col gap-2', className)}>
            <div className="flex items-center justify-between gap-2">
                <span className="text-[15px] font-medium tracking-[0.01em] text-secondary-foreground">
                    {title}
                </span>
                {action}
            </div>
            <div className="w-full">{children}</div>
        </div>
    );
};
