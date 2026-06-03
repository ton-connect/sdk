import { CHAIN, toUserFriendlyAddress } from '@tonconnect/ui';
import { useTonWallet } from './useTonWallet';
import { useMemo } from 'react';

/**
 * Reactive accessor for the connected account's TON address. Returns an
 * empty string while disconnected.
 *
 * @param userFriendly — `true` (default) returns the bounceable /
 *   non-bounceable base64url form (`UQ…` on mainnet, `0Q…` on testnet).
 *   Pass `false` to get the raw `<workchain>:<hex>` form.
 *
 * @example
 * ```tsx
 * const address = useTonAddress();      // user-friendly
 * const rawAddress = useTonAddress(false);
 * ```
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
