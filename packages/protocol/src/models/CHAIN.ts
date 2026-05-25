/**
 * Well-known TON network ids (`global_id`). Wire values are the protocol
 * strings — wallets advertise the active network through these constants
 * in {@link TonAddressItemReply.network} and accept them in request payloads.
 */
export enum CHAIN {
    /** TON mainnet (`global_id = -239`). */
    MAINNET = '-239',
    /** TON testnet (`global_id = -3`). */
    TESTNET = '-3'
}

/**
 * Network identifier accepted on the wire — either one of the well-known
 * {@link CHAIN} values, or a custom `global_id` string for private networks
 * not represented in the enum.
 */
export type ChainId = CHAIN | string;
