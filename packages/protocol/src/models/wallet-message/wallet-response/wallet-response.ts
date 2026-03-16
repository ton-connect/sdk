import { RpcMethod } from '../../rpc-method';
import {
    SendTransactionRpcResponseError,
    SendTransactionRpcResponseSuccess
} from './send-transaction-rpc-response';
import { SignDataRpcResponseError, SignDataRpcResponseSuccess } from './sign-data-rpc-response';
import {
    SignMessageRpcResponseError,
    SignMessageRpcResponseSuccess
} from './sign-message-rpc-response';
import {
    DisconnectRpcResponseError,
    DisconnectRpcResponseSuccess
} from './disconnect-rpc-response';
import {
    SignMessageDraftResponseError,
    SignMessageDraftResponseSuccess
} from './sign-message-draft-response';
import {
    SendTransactionDraftResponseError,
    SendTransactionDraftResponseSuccess
} from './send-transaction-draft-response';
import {
    SendActionDraftResponseError,
    SendActionDraftResponseSuccess
} from './send-action-draft-response';

export type RpcResponses = {
    sendTransaction: {
        error: SendTransactionRpcResponseError;
        success: SendTransactionRpcResponseSuccess;
    };

    signData: {
        error: SignDataRpcResponseError;
        success: SignDataRpcResponseSuccess;
    };

    signMessage: {
        error: SignMessageRpcResponseError;
        success: SignMessageRpcResponseSuccess;
    };

    disconnect: {
        error: DisconnectRpcResponseError;
        success: DisconnectRpcResponseSuccess;
    };

    sendTransactionDraft: {
        error: SendTransactionDraftResponseError;
        success: SendTransactionDraftResponseSuccess;
    };

    signMessageDraft: {
        error: SignMessageDraftResponseError;
        success: SignMessageDraftResponseSuccess;
    };

    actionDraft: {
        error: SendActionDraftResponseError;
        success: SendActionDraftResponseSuccess;
    };
};

export type WalletResponseSuccess<T extends RpcMethod> = RpcResponses[T]['success'];

export type WalletResponseError<T extends RpcMethod> = RpcResponses[T]['error'];

export type WalletResponse<T extends RpcMethod> = WalletResponseSuccess<T> | WalletResponseError<T>;
