import type { FC, ReactNode } from 'react';

import { cn } from '../../lib/utils';

interface ResultPanelProps {
    title: string;
    children: ReactNode;
    className?: string;
}

export const ResultPanel: FC<ResultPanelProps> = ({ title, children, className }) => {
    return (
        <div className={cn('flex w-full flex-col gap-2', className)}>
            <span className="text-[15px] font-medium tracking-[0.01em] text-secondary-foreground">
                {title}
            </span>
            <div className="w-full">{children}</div>
        </div>
    );
};
