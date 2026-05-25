import { Address } from '@ton/core';
import { TonApiClient } from '@ton-api/client';
import type { TonConnectUI } from '@tonconnect/ui-react';

const ta = new TonApiClient({
    baseUrl: 'https://tonapi.io'
});

export async function resolveGaslessWallet(
    tonConnectUi: TonConnectUI,
    senderAddress?: string
): Promise<{ walletAddress: Address; publicKey: string }> {
    const address = tonConnectUi.wallet?.account?.address ?? senderAddress;
    if (!address) {
        throw new Error('No wallet found.');
    }

    let publicKey = tonConnectUi.wallet?.account?.publicKey;
    if (!publicKey) {
        const response = await ta.accounts.getAccountPublicKey(Address.parse(address));
        publicKey = response.publicKey;
    }

    return { walletAddress: Address.parse(address), publicKey };
}
