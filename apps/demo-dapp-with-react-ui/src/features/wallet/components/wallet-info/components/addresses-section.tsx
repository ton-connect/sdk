import type { FC } from 'react';

import { CopyButton } from '../../../../../core/components/ui/copy-button';

import type { AddressFormat } from '../lib/address-formats';
import { Section } from './section';

interface AddressesSectionProps {
    formats: AddressFormat[];
    publicKey: string | undefined;
}

const shorten = (value: string): string =>
    value.length <= 20 ? value : `${value.slice(0, 8)}…${value.slice(-8)}`;

export const AddressesSection: FC<AddressesSectionProps> = ({ formats, publicKey }) => (
    <Section title="Addresses" testId="wallet-info-addresses">
        {formats.map(format => (
            <div
                key={format.id}
                className="flex items-center justify-between gap-2"
                data-testid={`wallet-info-addresses-row-${format.id}`}
            >
                <div className="flex min-w-0 flex-col">
                    <span className="text-sm font-medium text-foreground">{format.label}</span>
                    <span className="text-xs text-secondary-foreground">{format.description}</span>
                </div>
                <div className="flex items-center gap-1">
                    <span
                        className="font-mono text-sm text-foreground"
                        data-testid={`wallet-info-addresses-value-${format.id}`}
                    >
                        {shorten(format.value)}
                    </span>
                    <CopyButton
                        value={format.value}
                        aria-label={`Copy ${format.label} address`}
                        data-testid={`wallet-info-addresses-copy-${format.id}`}
                    />
                </div>
            </div>
        ))}

        {publicKey && (
            <div
                className="flex items-center justify-between gap-2"
                data-testid="wallet-info-addresses-row-public-key"
            >
                <div className="flex min-w-0 flex-col">
                    <span className="text-sm font-medium text-foreground">Public key</span>
                    <span className="text-xs text-secondary-foreground">ed25519</span>
                </div>
                <div className="flex items-center gap-1">
                    <span
                        className="font-mono text-sm text-foreground"
                        data-testid="wallet-info-addresses-value-public-key"
                    >
                        {shorten(publicKey)}
                    </span>
                    <CopyButton
                        value={publicKey}
                        aria-label="Copy public key"
                        data-testid="wallet-info-addresses-copy-public-key"
                    />
                </div>
            </div>
        )}
    </Section>
);
