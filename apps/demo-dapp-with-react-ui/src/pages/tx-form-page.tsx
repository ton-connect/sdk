import { Layout } from '@/core/components';
import { TransactionRequest } from '@/features/transactions';

export const TxFormPage = () => (
    <Layout
        title="Send transaction"
        subtitle="Build a transaction request — pick a preset, set valid-until, edit the JSON, and send or sign it via TonConnect."
    >
        <TransactionRequest />
    </Layout>
);
