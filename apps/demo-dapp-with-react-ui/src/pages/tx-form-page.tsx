import { Layout } from '../core/components/index';
import { SendTransaction } from '../features/transactions';

export const TxFormPage = () => (
    <Layout
        title="Send transaction"
        subtitle="Build a sendTransaction request — pick a preset, set valid-until, edit the JSON, and send it via TonConnect."
        data-testid="tx-form-page"
    >
        <SendTransaction />
    </Layout>
);
