import type { FC } from 'react';

import { InfoBlock } from '../../../../../core/components/ui/info-block';
import type { WalletNetwork } from '../../../../../core/hooks/use-wallet-network';

import { TON_TICKER } from '../lib/constants';

interface CreateJettonInfoProps {
    network: WalletNetwork;
    tonBalance: string | null;
    isTonBalanceLoading: boolean;
    decimals: number;
    testIdPrefix: string;
}

const renderNetwork = (network: WalletNetwork): string => {
    if (!network.isConnected) return '—';
    return network.name;
};

export const CreateJettonInfo: FC<CreateJettonInfoProps> = ({
    network,
    tonBalance,
    isTonBalanceLoading,
    decimals,
    testIdPrefix
}) => (
    <InfoBlock.Container data-testid={testIdPrefix}>
        <InfoBlock.Row data-testid={`${testIdPrefix}-network-row`}>
            <InfoBlock.Label data-testid={`${testIdPrefix}-network-label`}>Network</InfoBlock.Label>
            <InfoBlock.Value data-testid={`${testIdPrefix}-network-value`}>
                {renderNetwork(network)}
            </InfoBlock.Value>
        </InfoBlock.Row>

        <InfoBlock.Row data-testid={`${testIdPrefix}-ton-row`}>
            <InfoBlock.Label data-testid={`${testIdPrefix}-ton-label`}>TON Balance</InfoBlock.Label>
            {isTonBalanceLoading ? (
                <InfoBlock.ValueSkeleton data-testid={`${testIdPrefix}-ton-balance-skeleton`} />
            ) : (
                <InfoBlock.Value data-testid={`${testIdPrefix}-ton-balance`}>
                    {tonBalance ?? '0'} {TON_TICKER}
                </InfoBlock.Value>
            )}
        </InfoBlock.Row>

        <InfoBlock.Row data-testid={`${testIdPrefix}-decimals-row`}>
            <InfoBlock.Label data-testid={`${testIdPrefix}-decimals-label`}>Decimals</InfoBlock.Label>
            <InfoBlock.Value data-testid={`${testIdPrefix}-decimals-value`}>{decimals}</InfoBlock.Value>
        </InfoBlock.Row>
    </InfoBlock.Container>
);
