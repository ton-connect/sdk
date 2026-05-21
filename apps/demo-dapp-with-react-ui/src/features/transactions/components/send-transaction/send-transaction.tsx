import { TransactionRequest } from './transaction-request';

export const SendTransaction = () => (
    <TransactionRequest mode="send" testIdPrefix="tx-request" />
);
