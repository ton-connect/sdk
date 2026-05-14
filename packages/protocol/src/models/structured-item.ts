/**
 * Wire-format structured items used inside JSON-RPC payloads and embedded-request
 * expansion. These match the shape that travels over the bridge / URL.
 *
 * Field names follow the protocol verbatim: structured-item fields are
 * camelCase (e.g. `attachAmount`, `forwardPayload`); the legacy snake_case keys
 * (`extra_currency`) appear only where the original spec defined them.
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
