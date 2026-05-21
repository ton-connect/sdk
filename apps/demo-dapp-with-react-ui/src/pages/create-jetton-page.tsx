import { Layout } from '../core/components/index';
import { TON_CONNECT_DOCS } from '../core/config/demo-nav';
import { CreateJetton } from '../features/utilities/index';

export const CreateJettonPage = () => (
    <Layout
        title="Create jetton"
        docHref={TON_CONNECT_DOCS.sendTransactionJetton}
        subtitle="Deploy a jetton and mint the initial supply via the demo backend, then sign the transaction in your wallet."
        data-testid="create-jetton-page"
    >
        <CreateJetton />
    </Layout>
);
