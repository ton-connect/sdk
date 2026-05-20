import { fromNano } from '@ton/core';
import { useTonWallet } from '@tonconnect/ui-react';

import { useTonBalance } from '../../../../../core/hooks/use-ton-balance';
import { useWalletNetwork } from '../../../../../core/hooks/use-wallet-network';

/**
 * Wallet-derived state for the create-jetton form — same sources as
 * {@link useUsdtWallet}, without USDT jetton-wallet resolution.
 */
export function useCreateJettonWallet() {
    const wallet = useTonWallet();
    const senderAddress = wallet?.account.address;
    const network = useWalletNetwork();
    const tonBalanceQuery = useTonBalance(senderAddress);

    return {
        senderAddress,
        network,
        isWalletConnected: network.isConnected,
        tonBalance:
            tonBalanceQuery.data !== undefined ? fromNano(tonBalanceQuery.data) : null,
        isTonBalanceLoading: tonBalanceQuery.isLoading
    };
}
