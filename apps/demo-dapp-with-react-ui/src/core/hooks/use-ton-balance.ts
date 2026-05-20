import { useQuery } from '@tanstack/react-query';
import { CHAIN, useTonWallet } from '@tonconnect/ui-react';
import { Address } from '@ton/core';
import { TonClient } from '@ton/ton';

import { endpointByChain, isSupportedChain } from '../utils/ton-endpoints';

/**
 * Reads the native TON balance of `address` (nanoton) via the active wallet's
 * chain endpoint. Returns the raw `bigint` — callers format as needed.
 */
export const useTonBalance = (address: string | undefined) => {
    const wallet = useTonWallet();
    const chain = wallet?.account.chain;
    const enabled = !!address && isSupportedChain(chain);

    return useQuery({
        queryKey: ['ton-balance', chain, address],
        enabled,
        queryFn: async (): Promise<bigint> => {
            const client = new TonClient({ endpoint: endpointByChain[chain as CHAIN] });
            return client.getBalance(Address.parse(address!));
        }
    });
};
