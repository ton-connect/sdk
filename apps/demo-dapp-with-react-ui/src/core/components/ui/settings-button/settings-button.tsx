import type { ComponentProps, FC } from 'react';
import { SlidersHorizontal } from 'lucide-react';

import { cn } from '../../../lib/utils';
import { Button } from '../button';

export interface SettingsButtonProps extends ComponentProps<typeof Button> {
    onClick?: () => void;
}

export const SettingsButton: FC<SettingsButtonProps> = ({ onClick, className, ...props }) => {
    return (
        <Button
            className={cn('aspect-square size-[50px] shrink-0 [&_svg]:size-6', className)}
            variant="gray"
            size="l"
            borderRadius="l"
            onClick={onClick}
            aria-label="Settings"
            {...props}
        >
            <SlidersHorizontal />
        </Button>
    );
};
