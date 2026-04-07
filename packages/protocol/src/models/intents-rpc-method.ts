import { RpcMethod } from './rpc-method';

export type IntentRpcMethod = Extract<
    RpcMethod,
    'signData' | 'txDraft' | 'signMsgDraft' | 'actionDraft'
>;
