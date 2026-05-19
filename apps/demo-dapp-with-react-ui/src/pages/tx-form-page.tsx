import { Layout } from '@/core/components';
import { TransactionRequest } from '@/features/transactions';

export const TxFormPage = () => (
    <Layout
        title="Send transaction"
        subtitle="Build a transaction request — pick a preset, set valid-until, add messages with payload / state init, and send via TonConnect."
    >
        <TransactionRequest />
    </Layout>
);
