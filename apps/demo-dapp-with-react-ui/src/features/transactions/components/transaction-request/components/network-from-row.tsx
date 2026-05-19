import { ClipboardPaste } from 'lucide-react';

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
    const pasteFromClipboard = async () => {
        try {
            const text = await navigator.clipboard.readText();
            if (text) onFromChange(text.trim());
        } catch (error) {
            // permission denied / clipboard unavailable — silent
            console.warn('Clipboard read failed', error);
        }
    };

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
                    <Input.Slot side="right">
                        <button
                            type="button"
                            onClick={pasteFromClipboard}
                            aria-label="Paste from clipboard"
                            className="inline-flex cursor-pointer items-center justify-center rounded p-1 text-secondary-foreground transition-colors hover:bg-tertiary hover:text-foreground"
                        >
                            <ClipboardPaste className="size-4" />
                        </button>
                    </Input.Slot>
                </Input.Field>
            </Input>
        </div>
    );
}
