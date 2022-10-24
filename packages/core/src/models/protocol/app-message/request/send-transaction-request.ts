import { AppRequestTemplate } from './app-requset-template';

export interface SendTransactionRequest extends AppRequestTemplate {
    method: 'sendTransaction';
    params: [string];
    id: string;
}
