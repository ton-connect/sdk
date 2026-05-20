import { Layout } from '../core/components/index';
import { FindTransactionDemo } from '../features/utilities/index';

export const FindTxPage = () => (
    <Layout
        title="Find transaction"
        subtitle="Look up the on-chain transaction that corresponds to an external-in message BOC."
    >
        <FindTransactionDemo />
    </Layout>
);
