import { useQuery } from '@tanstack/react-query';
import { CHAIN, useTonWallet } from '@tonconnect/ui-react';
import { Address, fromNano } from '@ton/core';
import { TonClient } from '@ton/ton';
import { JettonMinter } from '@ton-community/assets-sdk';

import { formatUnits } from '../../../../../core/utils/units';
import { useJettonBalance } from '../../../../../core/hooks/use-jetton-balance';
import { useTonBalance } from '../../../../../core/hooks/use-ton-balance';
import { useWalletNetwork } from '../../../../../core/hooks/use-wallet-network';
import { endpointByChain } from '../../../../../core/utils/ton-endpoints';

import { USDT_DECIMALS, USDT_MASTER_BY_CHAIN } from '../utils/constants';

/**
 * Composes wallet-derived state for the USDT transfer form. Delegates raw
 * balances to the generic core hooks and formats them at this layer; resolves
 * the sender's jetton-wallet address via the chain-specific USDT master.
 * Network metadata (chain, name, raw chain id) comes from {@link useWalletNetwork}.
 */
export const useUsdtWallet = () => {
    const wallet = useTonWallet();
    const senderAddress = wallet?.account.address;
    const network = useWalletNetwork();
    const { rawChainId: rawChain, isConnected: isWalletConnected } = network;

    // Narrow to CHAIN — USDT master and TonCenter endpoints are only defined
    // for mainnet/testnet (no Tetra master here).
    const chain: CHAIN | undefined = network.isMainnet
        ? CHAIN.MAINNET
        : network.isTestnet
          ? CHAIN.TESTNET
          : undefined;

    const tonBalanceQuery = useTonBalance(senderAddress);

    const jettonWalletQuery = useQuery({
        queryKey: ['usdt-jetton-wallet', chain, senderAddress],
        enabled: !!senderAddress && !!chain,
        queryFn: async () => {
            const client = new TonClient({ endpoint: endpointByChain[chain!] });
            const master = client.open(
                JettonMinter.createFromAddress(USDT_MASTER_BY_CHAIN[chain!])
            );
            const address = await master.getWalletAddress(Address.parse(senderAddress!));
            return address.toString({ urlSafe: true, bounceable: true });
        }
    });

    const jettonWallet = jettonWalletQuery.data ?? null;
    const usdtBalanceQuery = useJettonBalance(jettonWallet ?? undefined);

    return {
        senderAddress,
        network,
        chain,
        rawChain,
        isWalletConnected,
        tonBalance: tonBalanceQuery.data !== undefined ? fromNano(tonBalanceQuery.data) : null,
        isTonBalanceLoading: tonBalanceQuery.isLoading,
        jettonWallet,
        isJettonWalletLoading: jettonWalletQuery.isLoading,
        usdtBalance:
            usdtBalanceQuery.data !== undefined
                ? formatUnits(usdtBalanceQuery.data, USDT_DECIMALS)
                : null,
        isUsdtBalanceLoading: usdtBalanceQuery.isLoading
    };
};
