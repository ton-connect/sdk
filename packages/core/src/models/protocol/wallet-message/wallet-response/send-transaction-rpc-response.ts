import { UserRejectsError } from 'src/errors';
import { UnknownError } from 'src/errors/unknown.error';
import {
    WalletResponseTemplateError,
    WalletResponseTemplateSuccess
} from 'src/models/protocol/wallet-message/wallet-response/wallet-response-template';

export type SendTransactionRpcResponse =
    | SendTransactionRpcResponseSuccess
    | SendTransactionRpcResponseError;

export interface SendTransactionRpcResponseSuccess extends WalletResponseTemplateSuccess {}

export interface SendTransactionRpcResponseError extends WalletResponseTemplateError {
    error: { code: SendTransactionErrors; message: string; data?: unknown };
    id: string;
}

export const sendTransactionErrors = {
    0: UnknownError,
    1: UserRejectsError
};

export type SendTransactionErrors = keyof typeof sendTransactionErrors;
