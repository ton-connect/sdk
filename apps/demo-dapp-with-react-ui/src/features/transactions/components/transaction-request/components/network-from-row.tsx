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
            <Input size="s">
                <Input.Header>
                    <Input.Title>Network (optional)</Input.Title>
                </Input.Header>
                {!isConnectionRestored ? (
                    <div className="h-9 animate-pulse rounded-md border border-tertiary bg-secondary/40" />
                ) : (
                    <Input.Field>
                        <Input.Input
                            value={network || walletNetwork}
                            onChange={e => onNetworkChange(e.target.value)}
                            placeholder={walletNetwork || 'e.g. -239 for mainnet'}
                            disabled={!!walletNetwork}
                        />
                    </Input.Field>
                )}
            </Input>
            <Input size="s">
                <Input.Header>
                    <Input.Title>From (optional)</Input.Title>
                </Input.Header>
                <Input.Field>
                    <Input.Input
                        value={from}
                        onChange={e => onFromChange(e.target.value)}
                        placeholder="Sender address"
                    />
                </Input.Field>
            </Input>
        </div>
    );
}
