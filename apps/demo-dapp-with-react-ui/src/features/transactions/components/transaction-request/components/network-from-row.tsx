import { Input } from '@/core/components/ui/input';

interface NetworkFromRowProps {
    network: string;
    onNetworkChange: (value: string) => void;
    from: string;
    onFromChange: (value: string) => void;
    walletNetwork: string;
    isConnectionRestored: boolean;
}

export function NetworkFromRow({
    network,
    onNetworkChange,
    from,
    onFromChange,
    walletNetwork,
    isConnectionRestored
}: NetworkFromRowProps) {
    return (
        <div className="grid gap-3 md:grid-cols-2">
            <div className="flex flex-col gap-2">
                <span className="text-xs text-secondary-foreground">Network (optional)</span>
                {!isConnectionRestored ? (
                    <div className="h-9 animate-pulse rounded-md border border-tertiary bg-secondary/40" />
                ) : (
                    <Input size="s">
                        <Input.Field>
                            <Input.Input
                                value={network || walletNetwork}
                                onChange={e => onNetworkChange(e.target.value)}
                                placeholder={walletNetwork || 'e.g. -239 for mainnet'}
                                disabled={!!walletNetwork}
                            />
                        </Input.Field>
                    </Input>
                )}
            </div>
            <div className="flex flex-col gap-2">
                <span className="text-xs text-secondary-foreground">From (optional)</span>
                <Input size="s">
                    <Input.Field>
                        <Input.Input
                            value={from}
                            onChange={e => onFromChange(e.target.value)}
                            placeholder="Sender address"
                        />
                    </Input.Field>
                </Input>
            </div>
        </div>
    );
}
