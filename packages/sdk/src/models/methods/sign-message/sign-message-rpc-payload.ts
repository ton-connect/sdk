import type { SignMessageRequest } from './sign-message-request';

export type SignMessageRpcPayload = Omit<SignMessageRequest, 'validUntil' | 'messages'> & {
    valid_until: number;
    messages: Array<
        Omit<SignMessageRequest['messages'][number], 'extraCurrency'> & {
            extra_currency?: SignMessageRequest['messages'][number]['extraCurrency'];
        }
    >;
};
