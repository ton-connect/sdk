import { useQuery } from '@tanstack/react-query';
import { CHAIN, useTonWallet } from '@tonconnect/ui-react';
import { Address } from '@ton/core';
import { createTonClient } from '../utils/create-ton-client';
import { isSupportedChain } from '../utils/ton-endpoints';

/**
 * Reads the native GRAM (formerly Toncoin) balance of `address` (nanogram) via the active wallet's
 * chain endpoint. Returns the raw `bigint` — callers format as needed.
 */
export const useTonBalance = (address: string | undefined) => {
    const wallet = useTonWallet();
    const chain = wallet?.account.chain;
    const enabled = !!address && isSupportedChain(chain);

    return useQuery({
        queryKey: ['ton-balance', chain, address],
        enabled,
        staleTime: 60_000,
        queryFn: async (): Promise<bigint> => {
            const client = createTonClient(chain as CHAIN);
            return client.getBalance(Address.parse(address!));
        }
    });
};
