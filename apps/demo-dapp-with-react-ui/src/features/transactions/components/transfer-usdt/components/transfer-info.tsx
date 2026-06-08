import type { ComponentProps, FC } from 'react';
import { ExternalLink } from 'lucide-react';

import { CopyButton } from '../../../../../core/components/ui/copy-button';
import { InfoBlock } from '../../../../../core/components/shared/info-block';
import type { WalletNetwork } from '../../../../../core/hooks/use-wallet-network';
import { cn } from '../../../../../core/utils/cn';
import { tonviewerBaseByChain } from '../../../../../core/utils/ton-endpoints';

import { TON_TICKER } from '../utils/constants';

interface TransferInfoProps extends ComponentProps<'div'> {
    network: WalletNetwork;
    jettonWallet: string | null;
    isJettonWalletLoading: boolean;
    tonBalance: string | null;
    isTonBalanceLoading: boolean;
    /**
     * Stable prefix for `data-testid` attributes. The root carries the prefix
     * directly; sub-elements get `${prefix}-network-row`, `${prefix}-ton-balance`, etc.
     */
    testIdPrefix: string;
}

const shortenAddress = (address: string): string =>
    address.length <= 15 ? address : `${address.slice(0, 6)}…${address.slice(-6)}`;

const iconButtonClass =
    'flex h-5 w-5 items-center justify-center rounded-sm text-secondary-foreground transition-colors hover:bg-tertiary hover:text-foreground';

const explorerHref = (chainId: WalletNetwork['chainId'], jettonWallet: string): string | null => {
    if (chainId === undefined) return null;
    return `${tonviewerBaseByChain[chainId]}/${jettonWallet}`;
};

export const TransferInfo: FC<TransferInfoProps> = ({
    network,
    jettonWallet,
    isJettonWalletLoading,
    tonBalance,
    isTonBalanceLoading,
    testIdPrefix,
    className,
    ...props
}) => {
    const tonviewerHref = jettonWallet ? explorerHref(network.chainId, jettonWallet) : null;

    return (
        <InfoBlock.Container className={cn(className)} data-testid={testIdPrefix} {...props}>
            <InfoBlock.Row data-testid={`${testIdPrefix}-network-row`}>
                <InfoBlock.Label>Network</InfoBlock.Label>
                <InfoBlock.Value data-testid={`${testIdPrefix}-network-value`}>
                    {network.isConnected ? network.name : '—'}
                </InfoBlock.Value>
            </InfoBlock.Row>

            <InfoBlock.Row data-testid={`${testIdPrefix}-ton-row`}>
                <InfoBlock.Label>TON balance</InfoBlock.Label>
                {isTonBalanceLoading ? (
                    <InfoBlock.ValueSkeleton data-testid={`${testIdPrefix}-ton-balance-skeleton`} />
                ) : (
                    <InfoBlock.Value data-testid={`${testIdPrefix}-ton-balance`}>
                        {tonBalance ?? '0'} {TON_TICKER}
                    </InfoBlock.Value>
                )}
            </InfoBlock.Row>

            <InfoBlock.Row data-testid={`${testIdPrefix}-jetton-wallet-row`}>
                <InfoBlock.Label>Jetton wallet</InfoBlock.Label>
                {isJettonWalletLoading ? (
                    <InfoBlock.ValueSkeleton
                        width={120}
                        data-testid={`${testIdPrefix}-jetton-wallet-skeleton`}
                    />
                ) : jettonWallet ? (
                    <div
                        className="flex items-center gap-1"
                        data-testid={`${testIdPrefix}-jetton-wallet-actions`}
                    >
                        <InfoBlock.Value data-testid={`${testIdPrefix}-jetton-wallet-value`}>
                            {shortenAddress(jettonWallet)}
                        </InfoBlock.Value>
                        <CopyButton
                            className="h-5 w-5"
                            value={jettonWallet}
                            aria-label="Copy jetton wallet address"
                            data-testid={`${testIdPrefix}-jetton-wallet-copy`}
                            iconSize={11}
                        />
                        {tonviewerHref && (
                            <a
                                className={iconButtonClass}
                                target="_blank"
                                rel="noreferrer"
                                href={tonviewerHref}
                                aria-label="View jetton wallet on explorer"
                                data-testid={`${testIdPrefix}-jetton-wallet-explorer`}
                            >
                                <ExternalLink size={11} />
                            </a>
                        )}
                    </div>
                ) : (
                    <InfoBlock.Value data-testid={`${testIdPrefix}-jetton-wallet-empty`}>
                        —
                    </InfoBlock.Value>
                )}
            </InfoBlock.Row>
        </InfoBlock.Container>
    );
};
