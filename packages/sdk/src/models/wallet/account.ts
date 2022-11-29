import { CHAIN } from '@tonconnect/protocol';

export interface Account {
    /**
     * User's address in "hex" format: "<wc>:<hex>".
     */
    address: string;

    /**
     * User's selected chain.
     */
    chain: CHAIN;
}
