import { Address } from '@ton/core';
import { JettonMinter } from '@ton-community/assets-sdk';
import type { CHAIN } from '@tonconnect/ui-react';

import { createTonClient } from '../../../../../core/utils/create-ton-client';

import { USDT_MASTER_BY_CHAIN } from './constants';

export async function resolveUsdtJettonWallet(
    senderAddress: string,
    chain: CHAIN
): Promise<string> {
    const client = createTonClient(chain);
    const master = client.open(JettonMinter.createFromAddress(USDT_MASTER_BY_CHAIN[chain]));
    const address = await master.getWalletAddress(Address.parse(senderAddress));
    return address.toString({ urlSafe: true, bounceable: true });
}
