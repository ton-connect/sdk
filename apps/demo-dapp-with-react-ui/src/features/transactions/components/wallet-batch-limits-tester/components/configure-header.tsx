import { RotateCcw } from 'lucide-react';

import { Button } from '../../../../../core/components/ui/button';
import { useIsMobile } from '../../../../../core/hooks/use-mobile';

interface ConfigureHeaderProps {
    onReset: () => void;
}

export const ConfigureHeader = ({ onReset }: ConfigureHeaderProps) => {
    const isMobile = useIsMobile();

    return (
        <div className="flex w-full flex-col gap-2 md:flex-row md:items-center md:justify-between">
            <h3 className="mb-3 pl-1 text-lg font-semibold text-foreground md:mb-0">
                Configure request
            </h3>
            <Button
                variant={isMobile ? 'bezeled' : 'ghost'}
                size="s"
                borderRadius={isMobile ? 'l' : undefined}
                onClick={onReset}
                fullWidth={isMobile}
                data-testid="batch-limits-reset-button"
            >
                <RotateCcw className="size-3.5" />
                Reset
            </Button>
        </div>
    );
};
