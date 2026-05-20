import type { ComponentProps, FC } from 'react';

import { TonIconCircle } from '../ui/icons/index';
import { cn } from '../../lib/utils';

export const AppLogo: FC<Omit<ComponentProps<'svg'>, 'width' | 'height'>> = ({
    className,
    ...props
}) => {
    return <TonIconCircle className={cn('size-10', className)} {...props} />;
};
