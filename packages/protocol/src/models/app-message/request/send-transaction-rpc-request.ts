import { ReturnStrategy } from '../return-strategy';

export interface SendTransactionRpcRequest {
    method: 'sendTransaction';
    params: [string];
    return: ReturnStrategy;
    id: string;
}
