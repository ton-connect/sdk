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
    MakeSendTransactionIntentRpcResponseError,
    MakeSendTransactionIntentRpcResponseSuccess
} from './make-send-transaction-intent-rpc-response';
import {
    MakeSignDataIntentRpcResponseError,
    MakeSignDataIntentRpcResponseSuccess
} from './make-sign-data-intent-rpc-response';
import {
    MakeSignMessageIntentRpcResponseError,
    MakeSignMessageIntentRpcResponseSuccess
} from './make-sign-message-intent-rpc-response';
import {
    MakeSendActionIntentRpcResponseError,
    MakeSendActionIntentRpcResponseSuccess
} from './make-send-action-intent-rpc-response';

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
};

export type IntentResponses = {
    txIntent: {
        error: MakeSendTransactionIntentRpcResponseError;
        success: MakeSendTransactionIntentRpcResponseSuccess;
    };
    signIntent: {
        error: MakeSignDataIntentRpcResponseError;
        success: MakeSignDataIntentRpcResponseSuccess;
    };
    signMsg: {
        error: MakeSignMessageIntentRpcResponseError;
        success: MakeSignMessageIntentRpcResponseSuccess;
    };
    actionIntent: {
        error: MakeSendActionIntentRpcResponseError;
        success: MakeSendActionIntentRpcResponseSuccess;
    };
};

export type WalletResponseSuccess<T extends RpcMethod> = RpcResponses[T]['success'];

export type WalletResponseError<T extends RpcMethod> = RpcResponses[T]['error'];

export type WalletResponse<T extends RpcMethod> = WalletResponseSuccess<T> | WalletResponseError<T>;
