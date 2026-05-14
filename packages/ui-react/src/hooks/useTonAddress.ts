import { CHAIN, toUserFriendlyAddress } from '@tonconnect/ui';
import { useTonWallet } from './useTonWallet';
import { useMemo } from 'react';

/**
 * Use it to get the user's current TON wallet address. Returns an empty string when no wallet is connected.
 * @param [userFriendly=true] allows to choose format of the address.
 */
export function useTonAddress(userFriendly = true): string {
    const wallet = useTonWallet();
    return useMemo(() => {
        if (wallet) {
            return userFriendly
                ? toUserFriendlyAddress(
                      wallet.account.address,
                      wallet.account.chain === CHAIN.TESTNET
                  )
                : wallet.account.address;
        } else {
            return '';
        }
    }, [wallet, userFriendly, wallet?.account.address, wallet?.account.chain]);
}
