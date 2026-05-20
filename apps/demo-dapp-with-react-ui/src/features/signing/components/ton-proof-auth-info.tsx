import type { Account } from '@tonconnect/ui-react';
import { Address } from '@ton/core';

import { CopyButton } from '../../../core/components/ui/copy-button/index';
import { InfoBlock } from '../../../core/components/ui/info-block';
import { truncateAddress } from '../../../core/lib/truncate-address';

const formatAddress = (address: string) =>
    Address.parse(address).toString({ urlSafe: true, bounceable: false });

interface TonProofAuthInfoProps {
    account: Account;
}

export function TonProofAuthInfo({ account }: TonProofAuthInfoProps) {
    const friendlyAddress = formatAddress(account.address);

    return (
        <InfoBlock.Container data-testid="ton-proof-auth-info">
            <InfoBlock.Row data-testid="ton-proof-auth-session-row">
                <InfoBlock.Label>Backend session</InfoBlock.Label>
                <InfoBlock.Value data-testid="ton-proof-auth-session-value">
                    Authenticated
                </InfoBlock.Value>
            </InfoBlock.Row>
            <InfoBlock.Row data-testid="ton-proof-auth-address-row">
                <InfoBlock.Label className="shrink-0">Address</InfoBlock.Label>
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
                </div>
            </InfoBlock.Row>
            <InfoBlock.Row data-testid="ton-proof-auth-network-row">
                <InfoBlock.Label>Network</InfoBlock.Label>
                <InfoBlock.Value data-testid="ton-proof-auth-network-value">
                    {account.chain}
                </InfoBlock.Value>
            </InfoBlock.Row>
        </InfoBlock.Container>
    );
}
