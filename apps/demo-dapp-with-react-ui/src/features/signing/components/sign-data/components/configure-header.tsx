import { RotateCcw } from 'lucide-react';

import { Button } from '../../../../../core/components/ui/button';
import { useIsMobile } from '../../../../../core/hooks/use-mobile';
import { useWalletNetwork } from '../../../../../core/hooks/use-wallet-network';

interface ConfigureHeaderProps {
    onReset: () => void;
}

export const ConfigureHeader = ({ onReset }: ConfigureHeaderProps) => {
    const isMobile = useIsMobile();
    const network = useWalletNetwork();

    return (
        <div
            className="flex w-full flex-col gap-2 md:flex-row md:items-center md:justify-between"
            data-testid="sign-data-configure-header"
        >
            <div className="mb-3 flex items-center gap-2 pl-1 md:mb-0">
                <h3
                    className="text-lg font-semibold text-foreground"
                    data-testid="sign-data-configure-title"
                >
                    Configure payload
                </h3>
                {network.isConnected && (
                    <span
                        className="rounded-full bg-secondary px-2 py-0.5 text-xs font-medium text-secondary-foreground"
                        data-testid="sign-data-network-badge"
                        data-network={network.chainId ?? 'unsupported'}
                    >
                        {network.name}
                    </span>
                )}
            </div>
            <Button
                variant={isMobile ? 'bezeled' : 'ghost'}
                size="s"
                borderRadius={isMobile ? 'l' : undefined}
                onClick={onReset}
                fullWidth={isMobile}
                data-testid="sign-data-reset-button"
            >
                <RotateCcw className="size-3.5" />
                Reset
            </Button>
        </div>
    );
};
