import { Checkbox } from '../../../../../core/components/ui/checkbox';
import { Modal } from '../../../../../core/components/ui/modal';
import { RadioCards } from '../../../../../core/components/ui/radio-cards';

import type { GaslessMode } from '../hooks/use-transfer-form';

interface TransferSettingsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    gasless: boolean;
    onGaslessChange: (next: boolean) => void;
    gaslessMode: GaslessMode;
    onGaslessModeChange: (next: GaslessMode) => void;
    withConnect: boolean;
    onWithConnectChange: (next: boolean) => void;
}

export const TransferSettingsModal = ({
    open,
    onOpenChange,
    gasless,
    onGaslessChange,
    gaslessMode,
    onGaslessModeChange,
    withConnect,
    onWithConnectChange
}: TransferSettingsModalProps) => (
    <Modal open={open} onOpenChange={onOpenChange} title="Settings">
        <div className="flex flex-col gap-4" data-testid="transfer-usdt-settings-modal">
            <label className="flex cursor-pointer flex-col gap-1">
                <span className="flex items-center gap-2 text-sm text-foreground">
                    <Checkbox
                        checked={withConnect}
                        onCheckedChange={v => onWithConnectChange(v === true)}
                        data-testid="transfer-usdt-settings-embed-checkbox"
                    />
                    Embed request in connect
                </span>
                <span className="pl-6 text-xs text-secondary-foreground">
                    Bundle the transfer into the connect URL (connect + send in one screen). Works
                    for standard transfers; gasless uses{' '}
                    <code className="text-foreground">signMessage</code> separately.
                </span>
            </label>

            <label className="flex cursor-pointer flex-col gap-1">
                <span className="flex items-center gap-2 text-sm text-foreground">
                    <Checkbox
                        checked={gasless}
                        onCheckedChange={v => onGaslessChange(v === true)}
                        data-testid="transfer-usdt-settings-gasless-checkbox"
                    />
                    Gasless transfer
                </span>
                <span className="pl-6 text-xs text-secondary-foreground">
                    Pay transfer fees in USDT via TonAPI gasless relay (mainnet only).
                </span>
            </label>

            {gasless && (
                <RadioCards
                    value={gaslessMode}
                    onChange={onGaslessModeChange}
                    data-testid="transfer-usdt-settings-gasless-mode"
                >
                    <RadioCards.Item value="messages">Messages</RadioCards.Item>
                    <RadioCards.Item value="items">Items</RadioCards.Item>
                </RadioCards>
            )}
        </div>
    </Modal>
);
