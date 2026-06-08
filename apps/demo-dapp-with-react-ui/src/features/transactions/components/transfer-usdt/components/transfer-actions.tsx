import type { ComponentProps, FC } from 'react';

import { ButtonWithConnect } from '../../../../../core/components/ui/button-with-connect';
import { SettingsButton } from '../../../../../core/components/ui/settings-button';
import { cn } from '../../../../../core/utils/cn';

interface TransferActionsProps extends ComponentProps<'div'> {
    label: string;
    onSend: () => void;
    onSettingsClick: () => void;
    sending: boolean;
    disabled: boolean;
    skipConnectPrompt: boolean;
}

export const TransferActions: FC<TransferActionsProps> = ({
    label,
    onSend,
    onSettingsClick,
    sending,
    disabled,
    skipConnectPrompt,
    className,
    ...props
}) => (
    <div className={cn('flex items-stretch gap-2', className)} {...props}>
        <ButtonWithConnect
            size="l"
            fullWidth
            onClick={onSend}
            loading={sending}
            disabled={disabled}
            skipConnectPrompt={skipConnectPrompt}
            data-testid="transfer-usdt-send-button"
        >
            {label}
        </ButtonWithConnect>
        <SettingsButton onClick={onSettingsClick} data-testid="transfer-usdt-settings-button" />
    </div>
);
