import { PersonalizedWalletInfo } from 'src/app/models/personalized-wallet-info';
import { isWalletInfoRemote } from '@tonconnect/sdk';

export function getUniqueBridges(walletsList: PersonalizedWalletInfo[]): { bridgeUrl: string }[] {
    const uniqueBridges = new Set(
        walletsList.filter(isWalletInfoRemote).map(item => item.bridgeUrl)
    );
    return Array.from(uniqueBridges).map(bridgeUrl => ({ bridgeUrl }));
}

export function bridgesIsEqual(
    left: { bridgeUrl: string }[] | null,
    right: { bridgeUrl: string }[] | null
): boolean {
    const leftSet = new Set(left?.map(i => i.bridgeUrl));
    const rightSet = new Set(right?.map(i => i.bridgeUrl));
    return leftSet.size === rightSet.size && [...leftSet].every(value => rightSet.has(value));
}
