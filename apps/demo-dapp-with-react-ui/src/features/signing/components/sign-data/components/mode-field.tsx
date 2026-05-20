import { Tabs } from '../../../../../core/components/ui/tabs';

import { isSignDataMode, type SignDataMode } from '../lib/payloads';

interface ModeFieldProps {
    mode: SignDataMode;
    onChange: (next: SignDataMode) => void;
}

export const ModeField = ({ mode, onChange }: ModeFieldProps) => (
    <Tabs
        value={mode}
        onValueChange={v => {
            if (isSignDataMode(v)) onChange(v);
        }}
    >
        <Tabs.List className="mb-3 w-full gap-1 rounded-xl" data-testid="sign-data-mode-tabs">
            <Tabs.Trigger
                value="text"
                className="w-full rounded-lg py-1.5 font-medium"
                data-testid="sign-data-mode-tab-text"
            >
                Text
            </Tabs.Trigger>
            <Tabs.Trigger
                value="binary"
                className="w-full rounded-lg py-1.5 font-medium"
                data-testid="sign-data-mode-tab-binary"
            >
                Binary
            </Tabs.Trigger>
            <Tabs.Trigger
                value="cell"
                className="w-full rounded-lg py-1.5 font-medium"
                data-testid="sign-data-mode-tab-cell"
            >
                Cell
            </Tabs.Trigger>
        </Tabs.List>
    </Tabs>
);
