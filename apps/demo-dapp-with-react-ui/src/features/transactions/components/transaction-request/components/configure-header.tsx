import { RotateCcw } from 'lucide-react';

import { Button } from '../../../../../core/components/ui/button';
import { useIsMobile } from '../../../../../core/hooks/use-mobile';

import type { PresetKey } from '../../../lib/transaction-presets';

import { PresetPicker } from './preset-picker';

interface ConfigureHeaderProps {
    onReset: () => void;
    onPresetSelect: (key: PresetKey) => void;
}

export const ConfigureHeader = ({ onReset, onPresetSelect }: ConfigureHeaderProps) => {
    const isMobile = useIsMobile();

    return (
        <div className="flex w-full flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <h3 className="text-lg font-semibold text-foreground pl-1 mb-3 md:mb-0">
                Configure request
            </h3>
            <div className="flex w-full flex-col-reverse gap-2 md:w-auto md:flex-row md:items-center">
                <Button
                    variant={isMobile ? 'bezeled' : 'ghost'}
                    size="s"
                    borderRadius={isMobile ? 'l' : undefined}
                    onClick={onReset}
                    fullWidth={isMobile}
                    data-testid="tx-request-reset-button"
                >
                    <RotateCcw className="size-3.5" />
                    Reset
                </Button>
                <PresetPicker onSelect={onPresetSelect} />
            </div>
        </div>
    );
};
