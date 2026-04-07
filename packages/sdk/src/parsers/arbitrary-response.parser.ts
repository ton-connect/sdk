import { RpcMethod, WalletResponseSuccess } from '@tonconnect/protocol';
import { TonConnectError } from 'src/errors';
import { signDataParser } from 'src/parsers/sign-data-parser';
import { WithoutId } from 'src/utils/types';
import { sendTransactionParser } from 'src/parsers/send-transaction-parser';
import { signMessageParser } from 'src/parsers/sign-message-parser';

export class ArbitraryResponseParser {
    convertFromRpcResponse(response: WithoutId<WalletResponseSuccess<RpcMethod>>) {
        const result = response.result;
        if (typeof result === 'string') {
            return sendTransactionParser.convertFromRpcResponse({ result });
        }

        if (typeof result === 'object') {
            if ('internal_boc' in result) {
                return signMessageParser.convertFromRpcResponse({ result });
            }

            if ('signature' in result) {
                return signDataParser.convertFromRpcResponse({ result });
            }
        }

        throw new TonConnectError('Unknown response');
    }
}

export const arbitraryResponseParser = new ArbitraryResponseParser();
