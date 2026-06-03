/**
 * Two baseline TON network IDs.
 */
export enum CHAIN {
    MAINNET = '-239',
    TESTNET = '-3'
}

/**
 * TON network identifier. May be extended with custom `global_id`s.
 *
 * @see [`NETWORK_ID` (Connect spec)](https://github.com/ton-blockchain/ton-connect/blob/main/spec/connect.md#network_id)
 */
export type ChainId = CHAIN | string;
