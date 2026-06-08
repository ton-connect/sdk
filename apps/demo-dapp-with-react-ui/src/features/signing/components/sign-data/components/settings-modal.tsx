import { Checkbox } from '../../../../../core/components/ui/checkbox';
import { Modal } from '../../../../../core/components/ui/modal';

interface SettingsModalProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    withConnect: boolean;
    onWithConnectChange: (next: boolean) => void;
}

export const SettingsModal = ({
    open,
    onOpenChange,
    withConnect,
    onWithConnectChange
}: SettingsModalProps) => (
    <Modal open={open} onOpenChange={onOpenChange} title="Settings">
        <div className="flex flex-col gap-4" data-testid="sign-data-settings-modal">
            <label className="flex cursor-pointer flex-col gap-1">
                <span className="flex items-center gap-2 text-sm text-foreground">
                    <Checkbox
                        checked={withConnect}
                        onCheckedChange={v => onWithConnectChange(v === true)}
                        data-testid="sign-data-settings-embed-checkbox"
                    />
                    Embed request in connect
                </span>
                <span className="pl-6 text-xs text-secondary-foreground">
                    Bundle the request into the connect URL so the wallet can show connect + sign in
                    one screen.
                </span>
            </label>
        </div>
    </Modal>
);
