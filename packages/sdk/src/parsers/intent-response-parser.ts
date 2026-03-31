import type { IntentResponse } from 'src/models';
import { sendActionDraftParser } from 'src/parsers/send-action-draft-parser';
import { sendTransactionDraftParser } from 'src/parsers/send-transaction-draft-parser';
import { signDataParser } from 'src/parsers/sign-data-parser';
import { signMessageDraftParser } from 'src/parsers/sign-message-draft-parser';
import { OptionalTraceable } from 'src/utils/types';

class IntentResponseParser {
    convertFromRpcResponse(response: unknown): IntentResponse {
        const typed = response as Record<string, unknown> | null;

        if (typed && typeof typed === 'object' && 'error' in typed) {
            return response as IntentResponse;
        }

        const traceId = typed && typeof typed.traceId === 'string' ? typed.traceId : undefined;
        const normalized = this.convertNormalizedIntentResponse(typed, traceId);

        if (normalized) {
            return normalized;
        }

        return this.convertRpcIntentResponse(response, typed?.result, traceId);
    }

    private convertNormalizedIntentResponse(
        typed: Record<string, unknown> | null,
        traceId?: string
    ): OptionalTraceable<IntentResponse> | null {
        if (typed && typeof typed.internalBoc === 'string') {
            return { internalBoc: typed.internalBoc, traceId };
        }

        if (typed && typeof typed.boc === 'string') {
            return { boc: typed.boc, traceId };
        }

        return null;
    }

    private convertRpcIntentResponse(
        response: unknown,
        result: unknown,
        traceId?: string
    ): OptionalTraceable<IntentResponse> {
        if (typeof result === 'string') {
            const converted = sendTransactionDraftParser.convertFromRpcResponse(response);
            return { ...converted, traceId };
        }

        if (result && typeof result === 'object') {
            const resultObj = result as Record<string, unknown>;

            if (typeof resultObj.internal_boc === 'string') {
                const converted = signMessageDraftParser.convertFromRpcResponse(response);
                return { ...converted, traceId };
            }

            if (typeof resultObj.signature === 'string') {
                const converted = signDataParser.convertFromRpcResponse(
                    response as Parameters<typeof signDataParser.convertFromRpcResponse>[0]
                );
                return { ...converted, traceId };
            }
        }

        const converted = sendActionDraftParser.convertFromRpcResponse(response);
        return { ...converted, traceId };
    }
}

export const intentResponseParser = new IntentResponseParser();
