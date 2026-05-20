import type { ComponentProps, FC } from 'react';
import { cn } from '../../../lib/utils';
import { SlidersHorizontal } from 'lucide-react';

import { Button } from '../button';

import styles from './settings-button.module.css';

export interface SettingsButtonProps extends ComponentProps<typeof Button> {
    onClick?: () => void;
}

export const SettingsButton: FC<SettingsButtonProps> = ({ onClick, className, ...props }) => {
    return (
        <Button
            className={cn(styles.settingsButton, className)}
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
