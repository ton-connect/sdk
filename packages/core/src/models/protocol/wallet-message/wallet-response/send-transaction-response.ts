import {
    WalletResponseTemplateError,
    WalletResponseTemplateSuccess
} from 'src/models/protocol/wallet-message/wallet-response/wallet-response-template';

export type SendTransactionResponse = SendTransactionResponseSuccess | SendTransactionResponseError;

export interface SendTransactionResponseSuccess extends WalletResponseTemplateSuccess {}

export interface SendTransactionResponseError extends WalletResponseTemplateError {
    error: { code: SendTransactionErrors; message: string; data?: unknown };
    id: string;
}

export const sendTransactionErrors = {
    0: 'Unknown error',
    1: 'User rejects the operation'
};

export type SendTransactionErrors = keyof typeof sendTransactionErrors;
