import { TransactionRequest } from '../send-transaction/transaction-request';

export const SignMessage = () => (
    <TransactionRequest mode="sign" testIdPrefix="sign-message" />
);
