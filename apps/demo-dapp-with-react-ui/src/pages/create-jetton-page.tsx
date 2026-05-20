import { Layout } from '../core/components/index';
import { CreateJetton } from '../features/utilities/index';

export const CreateJettonPage = () => (
    <Layout
        title="Create jetton"
        subtitle="Deploy a jetton and mint the initial supply via the protected backend, then sign the transaction in your wallet."
        data-testid="create-jetton-page"
    >
        <CreateJetton />
    </Layout>
);
