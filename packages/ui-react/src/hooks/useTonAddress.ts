import { CHAIN, toUserFriendlyAddress } from '@tonconnect/ui';
import { useTonWallet } from './useTonWallet';
import { useMemo } from 'react';

/**
 * Use it to get the user's current TON wallet address. Returns an empty string when no wallet is connected.
 *
 * When `userFriendly` is `true` (the default), the address is converted to
 * the non-bounceable user-friendly form, with the test-only flag set when
 * the wallet reports the testnet chain. Pass `false` to receive the raw
 * `0:<hex>` form straight from `wallet.account.address`.
 *
 * @param userFriendly allows to choose format of the address.
 * @throws {@link TonConnectProviderNotSetError} when called on the client side without a `<TonConnectUIProvider>` ancestor.
 * @example
 * function AddressLabel() {
 *     const userFriendly = useTonAddress();
 *     const raw = useTonAddress(false);
 *
 *     if (!userFriendly) {
 *         return null;
 *     }
 *
 *     return (
 *         <p>
 *             Address: {userFriendly} (raw: {raw})
 *         </p>
 *     );
 * }
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
