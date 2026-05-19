/**
 * Copyright (c) TonTech.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 */

import type { ComponentProps, FC, ReactNode } from 'react';
import type { LucideIcon } from 'lucide-react';

import { cn } from '@/core/lib/utils';

interface EmptyStateProps extends ComponentProps<'div'> {
    icon: LucideIcon;
    title: string;
    description?: string;
    action?: ReactNode;
}

export const EmptyState: FC<EmptyStateProps> = ({ icon: Icon, title, description, action, className, ...props }) => {
    return (
        <div
            className={cn(
                'flex flex-col items-center justify-center gap-4 rounded-2xl bg-secondary px-6 py-16 text-center',
                className,
            )}
            {...props}
        >
            <div className="flex size-16 items-center justify-center rounded-full bg-primary/10">
                <Icon className="size-8 text-primary" />
            </div>

            <div className="flex flex-col gap-1">
                <h3 className="text-lg font-semibold text-foreground">{title}</h3>
                {description && <p className="text-sm text-tertiary-foreground">{description}</p>}
            </div>

            {action && <div className="mt-2">{action}</div>}
        </div>
    );
};
