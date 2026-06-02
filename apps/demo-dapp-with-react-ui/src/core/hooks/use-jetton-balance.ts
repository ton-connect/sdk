import { useQuery } from '@tanstack/react-query';
import { CHAIN, useTonWallet } from '@tonconnect/ui-react';
import { Address } from '@ton/core';
import { JettonWallet } from '@ton/ton';

import { createTonClient } from '../utils/create-ton-client';
import { isSupportedChain } from '../utils/ton-endpoints';

/**
 * Reads the jetton balance held by `jettonWalletAddress` (the owner's jetton
 * wallet, not the master). Returns the raw `bigint` — callers apply jetton
 * decimals to format.
 */
export const useJettonBalance = (jettonWalletAddress: string | undefined) => {
    const wallet = useTonWallet();
    const chain = wallet?.account.chain;
    const enabled = !!jettonWalletAddress && isSupportedChain(chain);

    return useQuery({
        queryKey: ['jetton-balance', chain, jettonWalletAddress],
        enabled,
        staleTime: 60_000,
        queryFn: async (): Promise<bigint> => {
            const client = createTonClient(chain as CHAIN);
            const contract = client.open(JettonWallet.create(Address.parse(jettonWalletAddress!)));
            return contract.getBalance();
        }
    });
};
