import { SignDataRpcResponseSuccess, SignDataRpcResponseError } from './sign-data-rpc-response';

export type MakeSignDataIntentRpcResponse =
    | MakeSignDataIntentRpcResponseSuccess
    | MakeSignDataIntentRpcResponseError;

export type MakeSignDataIntentRpcResponseSuccess = SignDataRpcResponseSuccess;

export type MakeSignDataIntentRpcResponseError = SignDataRpcResponseError;
