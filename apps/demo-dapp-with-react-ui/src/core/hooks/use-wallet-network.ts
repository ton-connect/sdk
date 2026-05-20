import { CHAIN, useTonWallet } from '@tonconnect/ui-react';

import { CHAIN_TETRA } from '../utils/network';

export type SupportedChainId = CHAIN | typeof CHAIN_TETRA;

export interface WalletNetwork {
    /** Typed chain id if the wallet is on a recognized chain, undefined otherwise. */
    chainId: SupportedChainId | undefined;
    /** Raw chain string from the wallet (could be a chain id we don't recognize). */
    rawChainId: string | undefined;
    /** Human-readable label: "Mainnet", "Testnet", "Tetra", "Unsupported", "Disconnected". */
    name: string;
    isConnected: boolean;
    isMainnet: boolean;
    isTestnet: boolean;
    isTetra: boolean;
    /** True only when chainId is a recognized chain (mainnet, testnet, or tetra). */
    isSupported: boolean;
}

const NETWORK_NAME: Record<SupportedChainId, string> = {
    [CHAIN.MAINNET]: 'Mainnet',
    [CHAIN.TESTNET]: 'Testnet',
    [CHAIN_TETRA]: 'Tetra'
};

const isRecognizedChain = (chain: string | undefined): chain is SupportedChainId =>
    chain === CHAIN.MAINNET || chain === CHAIN.TESTNET || chain === CHAIN_TETRA;

/**
 * Resolves a chain id to its human-readable name. Returns `undefined` for
 * unrecognized ids — caller can fallback (e.g. "Any Network" in pickers,
 * the raw id, or a placeholder).
 */
export const getNetworkName = (chainId: string | undefined): string | undefined => {
    if (chainId === undefined) return undefined;
    if (isRecognizedChain(chainId)) return NETWORK_NAME[chainId];
    return undefined;
};

const labelFor = (isConnected: boolean, chainId: SupportedChainId | undefined): string => {
    if (!isConnected) return 'Disconnected';
    if (chainId === undefined) return 'Unsupported';
    return NETWORK_NAME[chainId];
};

/**
 * Reads the connected wallet's network state. Centralizes the
 * `wallet.account.chain` → chain id typing + the human-readable name, so
 * callers don't have to re-derive these in every feature.
 */
export const useWalletNetwork = (): WalletNetwork => {
    const wallet = useTonWallet();
    const rawChainId = wallet?.account.chain;
    const chainId: SupportedChainId | undefined = isRecognizedChain(rawChainId)
        ? rawChainId
        : undefined;
    const isConnected = !!wallet;

    return {
        chainId,
        rawChainId,
        name: labelFor(isConnected, chainId),
        isConnected,
        isMainnet: chainId === CHAIN.MAINNET,
        isTestnet: chainId === CHAIN.TESTNET,
        isTetra: chainId === CHAIN_TETRA,
        isSupported: chainId !== undefined
    };
};
