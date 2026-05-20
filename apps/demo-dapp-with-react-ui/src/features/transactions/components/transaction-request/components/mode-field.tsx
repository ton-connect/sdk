import { Tabs } from '../../../../../core/components/ui/tabs';

import type { RequestMode } from '../hooks';

interface ModeFieldProps {
    mode: RequestMode;
    onChange: (next: RequestMode) => void;
}

export const ModeField = ({ mode, onChange }: ModeFieldProps) => (
    <Tabs value={mode} onValueChange={v => onChange(v as RequestMode)}>
        <Tabs.List className="w-full gap-1 rounded-xl mb-3" data-testid="tx-request-mode-tabs">
            <Tabs.Trigger
                value="send"
                className="w-full rounded-lg py-1.5 font-medium"
                data-testid="tx-request-mode-tab-send"
            >
                Send transaction
            </Tabs.Trigger>
            <Tabs.Trigger
                value="sign"
                className="w-full rounded-lg py-1.5 font-medium"
                data-testid="tx-request-mode-tab-sign"
            >
                Sign message
            </Tabs.Trigger>
        </Tabs.List>
    </Tabs>
);
