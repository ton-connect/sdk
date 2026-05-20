import { Layout } from '../core/components/index';
import { WalletBatchLimitsTester } from '../features/transactions/index';

export const BatchLimitsPage = () => (
    <Layout
        title="Batch limits"
        subtitle="Probe how many messages a wallet accepts in a single sendTransaction or signMessage request."
    >
        <div data-testid="batch-limits-page">
            <WalletBatchLimitsTester />
        </div>
    </Layout>
);
