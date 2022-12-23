import { useTonWallet } from './useTonWallet';
import { toUserFriendlyAddress } from '@tonconnect/ui';

export function useTonAddress(userFriendly = true): string {
    const wallet = useTonWallet();

    if (wallet) {
        return userFriendly
            ? toUserFriendlyAddress(wallet.account.address)
            : wallet.account.address;
    } else {
        return '';
    }
}
