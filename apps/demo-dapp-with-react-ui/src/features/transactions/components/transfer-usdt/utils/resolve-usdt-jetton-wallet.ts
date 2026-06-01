import { Address } from '@ton/core';
import { TonClient } from '@ton/ton';
import { JettonMinter } from '@ton-community/assets-sdk';
import type { CHAIN } from '@tonconnect/ui-react';

import { endpointByChain } from '../../../../../core/utils/ton-endpoints';

import { USDT_MASTER_BY_CHAIN } from './constants';

export async function resolveUsdtJettonWallet(
    senderAddress: string,
    chain: CHAIN
): Promise<string> {
    const client = new TonClient({ endpoint: endpointByChain[chain] });
    const master = client.open(JettonMinter.createFromAddress(USDT_MASTER_BY_CHAIN[chain]));
    const address = await master.getWalletAddress(Address.parse(senderAddress));
    return address.toString({ urlSafe: true, bounceable: true });
}
