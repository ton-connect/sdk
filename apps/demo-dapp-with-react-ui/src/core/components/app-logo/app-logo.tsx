import type { ComponentProps, FC } from 'react';

import { TonIconCircle } from '@/core/components/ui/icons';
import { cn } from '@/core/lib/utils';

export const AppLogo: FC<Omit<ComponentProps<'svg'>, 'width' | 'height'>> = ({
    className,
    ...props
}) => {
    return <TonIconCircle className={cn('size-10', className)} {...props} />;
};
