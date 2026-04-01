import type { SignMessageRequest } from './sign-message-request';

type ArrayElement<T> = T extends Array<infer U> ? U : never;
type Message = ArrayElement<SignMessageRequest['messages']>;

export type SignMessageRpcPayload = Omit<SignMessageRequest, 'validUntil' | 'messages'> & {
    valid_until: number;
    messages: Array<Omit<Message, 'extraCurrency'> & { extra_currency?: Message['extraCurrency'] }>;
};
