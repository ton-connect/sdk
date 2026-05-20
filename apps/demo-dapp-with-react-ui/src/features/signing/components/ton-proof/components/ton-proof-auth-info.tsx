import type { Account } from '@tonconnect/ui-react';
import { Address } from '@ton/core';
import { ExternalLink } from 'lucide-react';

import { CopyButton } from '../../../../../core/components/ui/copy-button/index';
import { InfoBlock } from '../../../../../core/components/shared/info-block';
import type { WalletNetwork } from '../../../../../core/hooks/use-wallet-network';
import { tonviewerBaseByChain } from '../../../../../core/utils/ton-endpoints';
import { truncateAddress } from '../../../../../core/utils/truncate-address';

const formatAddress = (address: string) =>
    Address.parse(address).toString({ urlSafe: true, bounceable: false });

const iconButtonClass =
    'flex h-5 w-5 shrink-0 items-center justify-center rounded-sm text-secondary-foreground transition-colors hover:bg-tertiary hover:text-foreground';

interface TonProofAuthInfoProps {
    account: Account;
    network: WalletNetwork;
}

export function TonProofAuthInfo({ account, network }: TonProofAuthInfoProps) {
    const friendlyAddress = formatAddress(account.address);
    const tonviewerHref = network.chainId
        ? `${tonviewerBaseByChain[network.chainId]}/${friendlyAddress}`
        : null;

    return (
        <InfoBlock.Container data-testid="ton-proof-auth-info">
            <InfoBlock.Row data-testid="ton-proof-auth-session-row">
                <InfoBlock.Label data-testid="ton-proof-auth-session-label">
                    Backend session
                </InfoBlock.Label>
                <InfoBlock.Value data-testid="ton-proof-auth-session-value">
                    Authenticated
                </InfoBlock.Value>
            </InfoBlock.Row>
            <InfoBlock.Row data-testid="ton-proof-auth-address-row">
                <InfoBlock.Label className="shrink-0" data-testid="ton-proof-auth-address-label">
                    Address
                </InfoBlock.Label>
                <div
                    className="flex min-w-0 items-center gap-1"
                    data-testid="ton-proof-auth-address-actions"
                >
                    <InfoBlock.Value
                        className="min-w-0 truncate font-mono"
                        data-testid="ton-proof-auth-address-value"
                    >
                        {truncateAddress(friendlyAddress)}
                    </InfoBlock.Value>
                    <CopyButton
                        className="h-5 w-5 shrink-0"
                        value={friendlyAddress}
                        aria-label="Copy address"
                        data-testid="ton-proof-auth-address-copy"
                        iconSize={11}
                    />
                    {tonviewerHref && (
                        <a
                            className={iconButtonClass}
                            target="_blank"
                            rel="noreferrer"
                            href={tonviewerHref}
                            aria-label="View address on explorer"
                            data-testid="ton-proof-auth-address-explorer"
                        >
                            <ExternalLink size={11} />
                        </a>
                    )}
                </div>
            </InfoBlock.Row>
            <InfoBlock.Row data-testid="ton-proof-auth-network-row">
                <InfoBlock.Label data-testid="ton-proof-auth-network-label">
                    Network
                </InfoBlock.Label>
                <InfoBlock.Value data-testid="ton-proof-auth-network-value">
                    {network.name}
                </InfoBlock.Value>
            </InfoBlock.Row>
        </InfoBlock.Container>
    );
}
