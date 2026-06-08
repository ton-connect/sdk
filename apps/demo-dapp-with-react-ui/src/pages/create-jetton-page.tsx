import { Layout } from '../core/components/index';
import { TON_CONNECT_DOCS } from '../core/config/demo-nav';
import { DEMO_SOURCE_LINKS } from '../core/config/demo-source-links';
import { CreateJetton } from '../features/utilities/index';

export const CreateJettonPage = () => (
    <Layout
        title="Create jetton"
        docHref={TON_CONNECT_DOCS.sendTransactionJetton}
        sourceHref={DEMO_SOURCE_LINKS.createJetton}
        subtitle="Deploy a jetton and mint the initial supply via the demo backend, then sign the transaction in your wallet."
        data-testid="create-jetton-page"
    >
        <CreateJetton />
    </Layout>
);
