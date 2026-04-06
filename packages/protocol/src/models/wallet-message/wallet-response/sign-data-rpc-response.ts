import { ChainId } from '../../CHAIN';
import { WalletResponseTemplateError } from './wallet-response-template';

export type SignDataRpcResponse = SignDataRpcResponseSuccess | SignDataRpcResponseError;

export interface SignDataRpcResponseSuccess {
    result: {
        signature: string;
        address: string;
        timestamp: number;
        domain: string;
        payload: SignDataPayload;
    };
    id: string;
}

export type SignDataPayload = {
    network?: ChainId;
    from?: string;
} & (SignDataPayloadText | SignDataPayloadBinary | SignDataPayloadCell | SignDataPayloadEip712);

export type SignDataPayloadText = {
    type: 'text';
    text: string;
};

export type SignDataPayloadBinary = {
    type: 'binary';
    bytes: string;
};

export type SignDataPayloadCell = {
    type: 'cell';
    schema: string;
    cell: string;
};

export type SignDataPayloadEip712 = {
    type: 'eip712';
} & Eip712TypedData;

export interface Eip712TypedDataField {
    name: string;
    type: string;
}

export interface Eip712Domain {
    name?: string;
    version?: string;
    chainId?: number | string;
    verifyingContract?: string;
    salt?: string;
    [key: string]: unknown;
}

export interface Eip712TypedData {
    types: Record<string, Eip712TypedDataField[]>;
    primaryType: string;
    domain: Eip712Domain;
    message: Record<string, unknown>;
}

export interface SignDataRpcResponseError extends WalletResponseTemplateError {
    error: { code: SIGN_DATA_ERROR_CODES; message: string };
    id: string;
}

export enum SIGN_DATA_ERROR_CODES {
    UNKNOWN_ERROR = 0,
    BAD_REQUEST_ERROR = 1,
    UNKNOWN_APP_ERROR = 100,
    USER_REJECTS_ERROR = 300,
    METHOD_NOT_SUPPORTED = 400
}
