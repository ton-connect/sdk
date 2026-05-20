import { Tabs } from '../../../../../core/components/ui/tabs';

import type { BatchMode } from '../hooks';

interface ModeFieldProps {
    mode: BatchMode;
    onChange: (next: BatchMode) => void;
}

export const ModeField = ({ mode, onChange }: ModeFieldProps) => (
    <Tabs value={mode} onValueChange={v => onChange(v as BatchMode)}>
        <Tabs.List className="mb-3 w-full gap-1 rounded-xl" data-testid="batch-limits-mode-tabs">
            <Tabs.Trigger
                value="sendTransaction"
                className="w-full rounded-lg py-1.5 font-medium"
                data-testid="batch-limits-mode-tab-send"
            >
                Send Transaction
            </Tabs.Trigger>
            <Tabs.Trigger
                value="signMessage"
                className="w-full rounded-lg py-1.5 font-medium"
                data-testid="batch-limits-mode-tab-sign"
            >
                Sign Message
            </Tabs.Trigger>
        </Tabs.List>
    </Tabs>
);
