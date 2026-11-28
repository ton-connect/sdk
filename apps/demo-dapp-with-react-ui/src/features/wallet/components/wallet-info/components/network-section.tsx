import type { FC } from 'react';
import { CHAIN } from '@tonconnect/ui-react';
import { fromNano } from '@ton/core';

import { InfoBlock } from '../../../../../core/components/shared/info-block';

import { Section } from './section';

const NETWORK_LABEL: Record<CHAIN, string> = {
    [CHAIN.MAINNET]: 'Mainnet',
    [CHAIN.TESTNET]: 'Testnet'
};

const renderNetwork = (chain: string | undefined): string => {
    if (!chain) return '—';
    if (chain === CHAIN.MAINNET || chain === CHAIN.TESTNET) return NETWORK_LABEL[chain];
    return 'Unsupported';
};

interface NetworkSectionProps {
    chain: string | undefined;
    tonBalance: bigint | undefined;
    isTonBalanceLoading: boolean;
}

export const NetworkSection: FC<NetworkSectionProps> = ({
    chain,
    tonBalance,
    isTonBalanceLoading
}) => (
    <Section title="Network" testId="wallet-info-network">
        <InfoBlock.Row>
            <InfoBlock.Label>Chain</InfoBlock.Label>
            <InfoBlock.Value data-testid="wallet-info-network-chain">
                {renderNetwork(chain)}
            </InfoBlock.Value>
        </InfoBlock.Row>
        <InfoBlock.Row>
            <InfoBlock.Label>GRAM Balance</InfoBlock.Label>
            {isTonBalanceLoading ? (
                <InfoBlock.ValueSkeleton data-testid="wallet-info-network-ton-balance-skeleton" />
            ) : (
                <InfoBlock.Value data-testid="wallet-info-network-ton-balance">
                    {tonBalance !== undefined ? fromNano(tonBalance) : '—'} GRAM
                </InfoBlock.Value>
            )}
        </InfoBlock.Row>
    </Section>
);
