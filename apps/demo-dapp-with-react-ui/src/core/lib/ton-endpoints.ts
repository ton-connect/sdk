import { CHAIN } from '@tonconnect/ui-react';

import { CHAIN_TETRA } from '../utils/network';

export type SupportedChainId = CHAIN | typeof CHAIN_TETRA;

/** TonCenter RPC endpoints — only mainnet and testnet are supported. */
export const endpointByChain: Record<CHAIN, string> = {
    [CHAIN.MAINNET]: 'https://toncenter.com/api/v2/jsonRPC',
    [CHAIN.TESTNET]: 'https://testnet.toncenter.com/api/v2/jsonRPC'
};

/** Tonviewer explorer base URLs — covers all recognized chains including Tetra. */
export const tonviewerBaseByChain: Record<SupportedChainId, string> = {
    [CHAIN.MAINNET]: 'https://tonviewer.com',
    [CHAIN.TESTNET]: 'https://testnet.tonviewer.com',
    [CHAIN_TETRA]: 'https://tetra.tonviewer.com'
};

export const isSupportedChain = (chain: string | undefined): chain is CHAIN =>
    chain === CHAIN.MAINNET || chain === CHAIN.TESTNET;
