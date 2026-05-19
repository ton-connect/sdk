import { Layout } from '@/core/components';
import { CreateJettonDemo } from '@/features/utilities';

export const CreateJettonPage = () => (
    <Layout
        title="Create jetton"
        subtitle="Mint a new jetton via the demo backend with metadata and initial supply, then sign the deployment transaction."
    >
        <CreateJettonDemo />
    </Layout>
);
