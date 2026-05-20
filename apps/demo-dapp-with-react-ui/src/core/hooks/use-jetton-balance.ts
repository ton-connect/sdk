import { useQuery } from '@tanstack/react-query';
import { CHAIN, useTonWallet } from '@tonconnect/ui-react';
import { Address } from '@ton/core';
import { JettonWallet, TonClient } from '@ton/ton';

import { endpointByChain, isSupportedChain } from '../lib/ton-endpoints';

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
        queryFn: async (): Promise<bigint> => {
            const client = new TonClient({ endpoint: endpointByChain[chain as CHAIN] });
            const contract = client.open(JettonWallet.create(Address.parse(jettonWalletAddress!)));
            return contract.getBalance();
        }
    });
};
