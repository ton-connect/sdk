import { Layout } from '../core/components/index';
import { WalletBatchLimits } from '../features/transactions/index';

export const BatchLimitsPage = () => (
    <Layout
        title="Batch limits"
        subtitle="Probe how many messages a wallet accepts in a single sendTransaction or signMessage request."
        data-testid="batch-limits-page"
    >
        <WalletBatchLimits />
    </Layout>
);
