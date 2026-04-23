/**
 * Wire-format structured items used inside JSON-RPC payloads and embedded-request
 * expansion. These match the shape that travels over the bridge / URL — field
 * casing follows the protocol (e.g. `extra_currency` snake_case).
 *
 * The rich, user-facing counterparts (with camelCase fields) live in the SDK.
 */

export interface RpcTonItem {
    type: 'ton';
    address: string;
    amount: string;
    payload?: string;
    stateInit?: string;
    extra_currency?: { [k: number]: string };
}

export interface RpcJettonItem {
    type: 'jetton';
    master: string;
    destination: string;
    amount: string;
    attachAmount?: string;
    responseDestination?: string;
    customPayload?: string;
    forwardAmount?: string;
    forwardPayload?: string;
    queryId?: string;
}

export interface RpcNftItem {
    type: 'nft';
    nftAddress: string;
    newOwner: string;
    attachAmount?: string;
    responseDestination?: string;
    customPayload?: string;
    forwardAmount?: string;
    forwardPayload?: string;
    queryId?: string;
}

export type RpcStructuredItem = RpcTonItem | RpcJettonItem | RpcNftItem;
