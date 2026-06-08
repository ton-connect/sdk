import { Address } from '@ton/core';
import { CHAIN, useTonWallet } from '@tonconnect/ui-react';

import { CHAIN_TETRA } from '../utils/network';
import { useQueryState } from './use-query-state';

export interface RequestContextNetworkOption {
    id: string;
    label: string;
    value: string;
}

/**
 * Resolves QA-friendly defaults for `from` (connected wallet) and `network`
 * (connected chain, else `?chain=` from settings URL, else mainnet).
 */
export const useRequestContextSources = () => {
    const wallet = useTonWallet();
    const [desiredChain] = useQueryState('chain');

    const fromAddress = wallet?.account.address
        ? Address.parse(wallet.account.address).toString({
              urlSafe: true,
              bounceable: false
          })
        : undefined;

    const networks: RequestContextNetworkOption[] = [
        { id: 'mainnet', label: 'Mainnet', value: CHAIN.MAINNET },
        { id: 'testnet', label: 'Testnet', value: CHAIN.TESTNET }
    ];
    if (desiredChain === CHAIN_TETRA) {
        networks.push({ id: 'tetra', label: 'Tetra', value: CHAIN_TETRA });
    }

    return {
        fromAddress,
        networks
    };
};
