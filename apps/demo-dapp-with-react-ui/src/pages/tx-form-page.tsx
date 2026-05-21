import { Layout } from '../core/components/index';
import { TON_CONNECT_DOCS } from '../core/config/demo-nav';
import { SendTransaction } from '../features/transactions';

export const TxFormPage = () => (
    <Layout
        title="Send transaction"
        docHref={TON_CONNECT_DOCS.sendTransaction}
        subtitle="Build a sendTransaction request — pick a preset, set valid-until, edit the JSON, and send it via TonConnect."
        data-testid="tx-form-page"
    >
        <SendTransaction />
    </Layout>
);
