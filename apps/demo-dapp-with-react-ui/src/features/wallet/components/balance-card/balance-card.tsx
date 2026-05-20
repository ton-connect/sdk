import { useState } from 'react';
import { Address, fromNano } from '@ton/core';
import { useTonWallet } from '@tonconnect/ui-react';
import { ExternalLink } from 'lucide-react';

import { CopyButton } from '../../../../core/components/ui/copy-button';
import { Modal } from '../../../../core/components/ui/modal';
import { Skeleton } from '../../../../core/components/ui/skeleton';
import { useTonBalance } from '../../../../core/hooks/use-ton-balance';
import { useWalletNetwork } from '../../../../core/hooks/use-wallet-network';
import { tonviewerBaseByChain } from '../../../../core/utils/ton-endpoints';
import { truncateAddress } from '../../../../core/utils/truncate-address';

import { WalletInfo } from '../wallet-info';

const formatBalance = (nano: bigint): string => Number(fromNano(nano)).toFixed(4);

/**
 * Sidebar tile shown when a wallet is connected: TON balance, truncated
 * address with copy, a Details button that opens the {@link WalletInfo} modal,
 * and an external Tonviewer link. Hidden entirely when no wallet is connected.
 */
export const BalanceCard = () => {
    const wallet = useTonWallet();
    const network = useWalletNetwork();
    const balanceQuery = useTonBalance(wallet?.account.address);
    const [detailsOpen, setDetailsOpen] = useState(false);

    if (!wallet) return null;

    const friendlyAddress = Address.parse(wallet.account.address).toString({
        urlSafe: true,
        bounceable: false
    });
    const tonviewerHref = network.chainId
        ? `${tonviewerBaseByChain[network.chainId]}/${friendlyAddress}`
        : null;

    return (
        <>
            <div className="mb-2 px-1" data-testid="balance-card">
                <p className="text-base font-semibold text-foreground">Balance</p>
                <div className="mt-1 flex items-baseline gap-1.5">
                    {balanceQuery.isLoading ? (
                        <Skeleton
                            className="h-8 w-28"
                            data-testid="balance-card-balance-skeleton"
                        />
                    ) : (
                        <span
                            className="text-3xl font-bold text-foreground"
                            data-testid="balance-card-balance"
                        >
                            {balanceQuery.data !== undefined
                                ? formatBalance(balanceQuery.data)
                                : '0'}
                        </span>
                    )}
                    <span className="text-base font-medium text-tertiary-foreground">TON</span>
                </div>

                <div className="mt-3 flex items-center gap-1.5">
                    <span
                        className="truncate font-mono text-xs text-tertiary-foreground"
                        title={friendlyAddress}
                        data-testid="balance-card-address"
                    >
                        {truncateAddress(friendlyAddress)}
                    </span>
                    <CopyButton
                        className="h-5 w-5"
                        iconSize={12}
                        value={friendlyAddress}
                        aria-label="Copy address"
                        data-testid="balance-card-copy-button"
                    />
                </div>

                <div className="mt-2 flex items-center gap-3 text-xs">
                    <button
                        type="button"
                        onClick={() => setDetailsOpen(true)}
                        className="inline-flex cursor-pointer items-center gap-1 text-tertiary-foreground transition-colors hover:text-foreground"
                        data-testid="balance-card-details-button"
                    >
                        Details
                    </button>
                    {tonviewerHref && (
                        <a
                            href={tonviewerHref}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 text-tertiary-foreground transition-colors hover:text-foreground"
                            data-testid="balance-card-tonviewer-link"
                        >
                            Tonviewer
                            <ExternalLink className="size-3" />
                        </a>
                    )}
                </div>
            </div>

            <Modal
                open={detailsOpen}
                onOpenChange={setDetailsOpen}
                title="Wallet info"
                bodyClassName="!max-h-[70vh] overflow-y-auto"
            >
                <WalletInfo />
            </Modal>
        </>
    );
};
