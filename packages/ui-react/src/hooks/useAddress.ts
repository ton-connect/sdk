import { useWallet } from './useWallet';
import { toUserFriendlyAddress } from '@tonconnect/ui';

export function useAddress(userFriendly = true): string {
    const wallet = useWallet();

    if (wallet) {
        return userFriendly
            ? toUserFriendlyAddress(wallet.account.address)
            : wallet.account.address;
    } else {
        return '';
    }
}
