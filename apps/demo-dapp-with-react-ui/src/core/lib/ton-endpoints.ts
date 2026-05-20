import { CHAIN } from '@tonconnect/ui-react';

export const endpointByChain: Record<CHAIN, string> = {
    [CHAIN.MAINNET]: 'https://toncenter.com/api/v2/jsonRPC',
    [CHAIN.TESTNET]: 'https://testnet.toncenter.com/api/v2/jsonRPC'
};

export const tonviewerBaseByChain: Record<CHAIN, string> = {
    [CHAIN.MAINNET]: 'https://tonviewer.com',
    [CHAIN.TESTNET]: 'https://testnet.tonviewer.com'
};

export const isSupportedChain = (chain: string | undefined): chain is CHAIN =>
    chain === CHAIN.MAINNET || chain === CHAIN.TESTNET;
