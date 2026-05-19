import { Layout } from '@/core/components';
import { FindTransactionDemo } from '@/features/utilities';

export const FindTxPage = () => (
    <Layout
        title="Find transaction"
        subtitle="Look up the on-chain transaction that corresponds to an external-in message BOC."
    >
        <FindTransactionDemo />
    </Layout>
);
