import { Address } from '@ton/core';
import { CHAIN } from '@tonconnect/ui-react';

/**
 * USDT jetton master per chain. The mainnet address is Tether's official USDT;
 * the testnet address is the community-used Tether-style testnet jetton.
 */
export const USDT_MASTER_BY_CHAIN: Record<CHAIN, Address> = {
    [CHAIN.MAINNET]: Address.parse('EQCxE6mUtQJKFnGfaROTKOt1lZbDiiX1kCixRv7Nw2Id_sDs'),
    [CHAIN.TESTNET]: Address.parse('kQD0GKBM8ZbryVk2aESmzfU6b9b_8era_IkvBSELujFZPsyy')
};

export const USDT_DECIMALS = 6;
export const USDT_TICKER = 'USDT';

export const TON_TICKER = 'TON';

export const FORWARD_AMOUNT_TON = '0.001';
export const ATTACHED_AMOUNT_TON = '0.05';
export const VALID_UNTIL_SECONDS = 600;
