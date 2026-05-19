import { Layout } from '@/core/components';
import { WalletBatchLimitsTester } from '@/features/transactions';

export const BatchLimitsPage = () => (
    <Layout
        title="Batch limits"
        subtitle="Probe how many messages a wallet accepts in a single sendTransaction or signMessage request."
    >
        <WalletBatchLimitsTester />
    </Layout>
);
