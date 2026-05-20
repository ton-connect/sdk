import type { FC } from 'react';
import type { CHAIN } from '@tonconnect/ui-react';
import { ExternalLink } from 'lucide-react';

import { CopyButton } from '@/core/components/ui/copy-button';
import { InfoBlock } from '@/core/components/ui/info-block';
import { tonviewerBaseByChain } from '@/core/lib/ton-endpoints';

import { NETWORK_LABEL_BY_CHAIN, TON_TICKER } from '../lib/constants';

interface TransferInfoProps {
    chain: CHAIN | undefined;
    rawChain: string | undefined;
    jettonWallet: string | null;
    isJettonWalletLoading: boolean;
    tonBalance: string | null;
    isTonBalanceLoading: boolean;
}

const renderNetwork = (chain: CHAIN | undefined, rawChain: string | undefined): string => {
    if (chain) return NETWORK_LABEL_BY_CHAIN[chain];
    if (rawChain) return 'Unsupported';
    return '—';
};

const shortenAddress = (address: string): string =>
    address.length <= 15 ? address : `${address.slice(0, 6)}…${address.slice(-6)}`;

const iconButtonClass =
    'flex h-5 w-5 items-center justify-center rounded-sm text-secondary-foreground transition-colors hover:bg-tertiary hover:text-foreground';

export const TransferInfo: FC<TransferInfoProps> = ({
    chain,
    rawChain,
    jettonWallet,
    isJettonWalletLoading,
    tonBalance,
    isTonBalanceLoading
}) => (
    <InfoBlock.Container data-testid="transfer-usdt-info-block">
        <InfoBlock.Row data-testid="transfer-usdt-info-network-row">
            <InfoBlock.Label data-testid="transfer-usdt-info-network-label">
                Network
            </InfoBlock.Label>
            <InfoBlock.Value data-testid="transfer-usdt-info-network-value">
                {renderNetwork(chain, rawChain)}
            </InfoBlock.Value>
        </InfoBlock.Row>

        <InfoBlock.Row data-testid="transfer-usdt-info-ton-row">
            <InfoBlock.Label data-testid="transfer-usdt-info-ton-label">
                TON Balance
            </InfoBlock.Label>
            {isTonBalanceLoading ? (
                <InfoBlock.ValueSkeleton data-testid="transfer-usdt-info-ton-balance-skeleton" />
            ) : (
                <InfoBlock.Value data-testid="transfer-usdt-info-ton-balance">
                    {tonBalance ?? '0'} {TON_TICKER}
                </InfoBlock.Value>
            )}
        </InfoBlock.Row>

        <InfoBlock.Row data-testid="transfer-usdt-info-jetton-wallet-row">
            <InfoBlock.Label data-testid="transfer-usdt-info-jetton-wallet-label">
                Jetton Wallet
            </InfoBlock.Label>
            {isJettonWalletLoading ? (
                <InfoBlock.ValueSkeleton
                    width={120}
                    data-testid="transfer-usdt-info-jetton-wallet-skeleton"
                />
            ) : jettonWallet && chain ? (
                <div
                    className="flex items-center gap-1"
                    data-testid="transfer-usdt-info-jetton-wallet-actions"
                >
                    <InfoBlock.Value data-testid="transfer-usdt-info-jetton-wallet-value">
                        {shortenAddress(jettonWallet)}
                    </InfoBlock.Value>
                    <CopyButton
                        className="h-5 w-5"
                        value={jettonWallet}
                        aria-label="Copy jetton wallet address"
                        data-testid="transfer-usdt-info-jetton-wallet-copy"
                        iconSize={11}
                    />
                    <a
                        className={iconButtonClass}
                        target="_blank"
                        rel="noreferrer"
                        href={`${tonviewerBaseByChain[chain]}/${jettonWallet}`}
                        aria-label="View jetton wallet on explorer"
                        data-testid="transfer-usdt-info-jetton-wallet-explorer"
                    >
                        <ExternalLink size={11} />
                    </a>
                </div>
            ) : (
                <InfoBlock.Value data-testid="transfer-usdt-info-jetton-wallet-empty">
                    —
                </InfoBlock.Value>
            )}
        </InfoBlock.Row>
    </InfoBlock.Container>
);
