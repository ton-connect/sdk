import { RpcMethod } from '../../rpc-method';
import { SendTransactionRpcResponseError, SendTransactionRpcResponseSuccess } from './send-transaction-rpc-response';
import { SignDataRpcResponseError, SignDataRpcResponseSuccess } from './sign-data-rpc-response';
import { DisconnectRpcResponseError, DisconnectRpcResponseSuccess } from './disconnect-rpc-response';
import { DecryptDataRpcResponseError, DecryptDataRpcResponseSuccess } from './decrypt-rpc-response';
import { EncryptDataRpcResponseError, EncryptDataRpcResponseSuccess } from './encrypt-rpc-response';
export declare type RpcResponses = {
    sendTransaction: {
        error: SendTransactionRpcResponseError;
        success: SendTransactionRpcResponseSuccess;
    };
    signData: {
        error: SignDataRpcResponseError;
        success: SignDataRpcResponseSuccess;
    };
    disconnect: {
        error: DisconnectRpcResponseError;
        success: DisconnectRpcResponseSuccess;
    };
    decryptData: {
        error: DecryptDataRpcResponseError;
        success: DecryptDataRpcResponseSuccess;
    };
    encryptData: {
        error: EncryptDataRpcResponseError;
        success: EncryptDataRpcResponseSuccess;
    };
};
export declare type WalletResponseSuccess<T extends RpcMethod> = RpcResponses[T]['success'];
export declare type WalletResponseError<T extends RpcMethod> = RpcResponses[T]['error'];
export declare type WalletResponse<T extends RpcMethod> = WalletResponseSuccess<T> | WalletResponseError<T>;
