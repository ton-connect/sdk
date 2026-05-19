import { Layout } from '@/core/components';
import { WalletBatchLimitsTester } from '@/features/transactions';

export const BatchLimitsPage = () => (
    <Layout title="Batch limits">
        <WalletBatchLimitsTester />
    </Layout>
);
