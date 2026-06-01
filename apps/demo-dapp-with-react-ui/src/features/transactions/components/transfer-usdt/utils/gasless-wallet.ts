import { Address } from '@ton/core';
import { TonApiClient } from '@ton-api/client';
import type { TonConnectUI } from '@tonconnect/ui-react';

const ta = new TonApiClient({
    baseUrl: 'https://tonapi.io'
});

const CONNECT_TIMEOUT_MS = 120_000;

/** Opens the connect modal and waits until a wallet address is available. */
export async function waitForWalletConnection(tonConnectUi: TonConnectUI): Promise<void> {
    if (tonConnectUi.wallet?.account?.address) {
        return;
    }

    await new Promise<void>((resolve, reject) => {
        const timeoutId = setTimeout(() => {
            unsubscribe();
            reject(new Error('Wallet connection timed out'));
        }, CONNECT_TIMEOUT_MS);

        const unsubscribe = tonConnectUi.onStatusChange(wallet => {
            if (wallet?.account?.address) {
                clearTimeout(timeoutId);
                unsubscribe();
                resolve();
            }
        });

        void tonConnectUi.openModal();
    });
}

export async function resolveGaslessWallet(
    tonConnectUi: TonConnectUI,
    senderAddress?: string,
    options?: { withConnect?: boolean }
): Promise<{ walletAddress: Address; publicKey: string }> {
    if (
        !tonConnectUi.wallet?.account?.address &&
        !senderAddress &&
        options?.withConnect
    ) {
        await waitForWalletConnection(tonConnectUi);
    }

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
