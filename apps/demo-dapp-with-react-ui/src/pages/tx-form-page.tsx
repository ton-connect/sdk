import { Layout } from '../core/components/index';
import { TransactionRequest } from '../features/transactions';

export const TxFormPage = () => (
    <Layout
        title="Send transaction"
        subtitle="Build a transaction request — pick a preset, set valid-until, edit the JSON, and send or sign it via TonConnect."
        data-testid="tx-form-page"
    >
        <TransactionRequest />
    </Layout>
);
