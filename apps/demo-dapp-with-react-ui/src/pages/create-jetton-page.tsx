import { Layout } from '../core/components/index';
import { CreateJettonDemo } from '../features/utilities/index';

export const CreateJettonPage = () => (
    <Layout
        title="Create jetton"
        subtitle="Mint a new jetton via the demo backend with metadata and initial supply, then sign the deployment transaction."
    >
        <CreateJettonDemo />
    </Layout>
);
