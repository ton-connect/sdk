import { RpcStructuredItem } from '@tonconnect/protocol';
import { StructuredItem } from 'src/models/methods/send-transaction/structured-item';
import { normalizeBase64 } from 'src/utils/base64';

export function normalizeStructuredItem(item: StructuredItem): RpcStructuredItem {
    switch (item.type) {
        case 'ton': {
            const { extraCurrency, ...rest } = item;
            return {
                ...rest,
                payload: normalizeBase64(item.payload),
                stateInit: normalizeBase64(item.stateInit),
                extra_currency: extraCurrency
            };
        }
        case 'jetton': {
            return {
                ...item,
                customPayload: normalizeBase64(item.customPayload),
                forwardPayload: normalizeBase64(item.forwardPayload)
            };
        }
        case 'nft': {
            return {
                ...item,
                customPayload: normalizeBase64(item.customPayload),
                forwardPayload: normalizeBase64(item.forwardPayload)
            };
        }
    }
}
