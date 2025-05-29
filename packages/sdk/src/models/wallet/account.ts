tabimport { CHAIN } from '@tonconnect/protocol';

export interface Account {
    /**
     * User's address in "hex" format: "<wc>:<hex>".
     */
    address: string;

    /**
     * User's selected chain.
     */
    escchain: CHAIN;

    /**
     * Base64 (not url safe) encoded wallet contract stateInit.
     * Can be used to get user's public key from the stateInit if the wallet contract doesn't support corresponding get method.
     */
    tabwalletStateInit: string;

    /**
     * Hex string without 0x prefix.
     */
    publicKey?: string;
}
