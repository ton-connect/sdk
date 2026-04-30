import {
    RpcMethod,
    SignDataRpcResponseSuccess,
    SignMessageRpcResponseSuccess,
    WalletResponse,
    WalletResponseError,
    WireEmbeddedRequest,
    WireItem,
    WireMessage
} from '@tonconnect/protocol';

import {
    EmbeddedResponse,
    EmbeddedRequest,
    hasItems,
    SendTransactionRequest,
    SendTransactionRequestWithItems,
    SendTransactionRequestWithMessages,
    StructuredItem
} from 'src/models';
import { normalizeBase64 } from 'src/utils/base64';
import { WithoutId } from 'src/utils/types';

function buildAppRequestPayload(richRequest: EmbeddedRequest): WireEmbeddedRequest {
    switch (richRequest.method) {
        case 'sendTransaction': {
            const tx = richRequest.request;
            return {
                m: 'st',
                ...(tx.from ? { f: tx.from } : {}),
                ...(tx.network ? { n: tx.network } : {}),
                vu: tx.validUntil,
                ...buildWireTransactionBody(tx)
            };
        }
        case 'signMessage': {
            const msg = richRequest.request;
            return {
                m: 'sm',
                ...(msg.from ? { f: msg.from } : {}),
                ...(msg.network ? { n: msg.network } : {}),
                vu: msg.validUntil,
                ...buildWireTransactionBody(msg)
            };
        }
        case 'signData': {
            const sd = richRequest.request;
            const base: { m: 'sd'; n?: string; f?: string } = {
                m: 'sd',
                ...(sd.from ? { f: sd.from } : {}),
                ...(sd.network ? { n: sd.network } : {})
            };

            switch (sd.type) {
                case 'text':
                    return { ...base, t: 'text', tx: sd.text };
                case 'binary':
                    return { ...base, t: 'binary', b: sd.bytes };
                case 'cell':
                    return { ...base, t: 'cell', s: sd.schema, c: sd.cell };
            }
        }
    }
}

function buildWireTransactionBody(tx: SendTransactionRequest): {
    ms?: WireMessage[];
    i?: WireItem[];
} {
    if (hasItems(tx)) {
        return {
            i: (tx as SendTransactionRequestWithItems).items.map(item => buildWireItem(item))
        };
    }

    return {
        ms: (tx as SendTransactionRequestWithMessages).messages.map(msg => {
            const wire: WireMessage = {
                a: msg.address,
                am: msg.amount
            };
            if (msg.payload) {
                wire.p = normalizeBase64(msg.payload);
            }
            if (msg.stateInit) {
                wire.si = normalizeBase64(msg.stateInit);
            }
            if (msg.extraCurrency) {
                wire.ec = msg.extraCurrency;
            }
            return wire;
        })
    };
}

function buildWireItem(item: StructuredItem): WireItem {
    switch (item.type) {
        case 'ton':
            return {
                t: 'ton',
                a: item.address,
                am: item.amount,
                ...(item.payload ? { p: normalizeBase64(item.payload) } : {}),
                ...(item.stateInit ? { si: normalizeBase64(item.stateInit) } : {}),
                ...(item.extraCurrency ? { ec: item.extraCurrency } : {})
            };
        case 'jetton':
            return {
                t: 'jetton',
                ma: item.master,
                d: item.destination,
                am: item.amount,
                ...(item.attachAmount ? { aa: item.attachAmount } : {}),
                ...(item.responseDestination ? { rd: item.responseDestination } : {}),
                ...(item.customPayload ? { cp: normalizeBase64(item.customPayload) } : {}),
                ...(item.forwardAmount ? { fa: item.forwardAmount } : {}),
                ...(item.forwardPayload ? { fp: normalizeBase64(item.forwardPayload) } : {}),
                ...(item.queryId ? { qi: item.queryId } : {})
            };
        case 'nft':
            return {
                t: 'nft',
                na: item.nftAddress,
                no: item.newOwner,
                ...(item.attachAmount ? { aa: item.attachAmount } : {}),
                ...(item.responseDestination ? { rd: item.responseDestination } : {}),
                ...(item.customPayload ? { cp: normalizeBase64(item.customPayload) } : {}),
                ...(item.forwardAmount ? { fa: item.forwardAmount } : {}),
                ...(item.forwardPayload ? { fp: normalizeBase64(item.forwardPayload) } : {}),
                ...(item.queryId ? { qi: item.queryId } : {})
            };
    }
}

export class WireEmbeddedRequestParser {
    convertToWireEmbeddedRequest = buildAppRequestPayload;

    public isError(
        response: WithoutId<WalletResponse<RpcMethod>>
    ): response is WithoutId<WalletResponseError<RpcMethod>> {
        return 'error' in response;
    }

    convertFromRpcResponse(
        method: EmbeddedRequest['method'],
        response: WalletResponse<RpcMethod>
    ): EmbeddedResponse {
        if (this.isError(response)) {
            return { ok: false, error: response.error };
        }

        switch (method) {
            case 'sendTransaction':
                return { ok: true, result: { boc: response.result as string } };
            case 'signMessage': {
                return {
                    ok: true,
                    result: {
                        internalBoc: (response as SignMessageRpcResponseSuccess).result.internalBoc
                    }
                };
            }
            case 'signData': {
                return { ok: true, result: (response as SignDataRpcResponseSuccess).result };
            }
            default:
                throw new Error(`Unexpected embedded request method: ${method}`);
        }
    }
}

export const wireRequestParser = new WireEmbeddedRequestParser();
