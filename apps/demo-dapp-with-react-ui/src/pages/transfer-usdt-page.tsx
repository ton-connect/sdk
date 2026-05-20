import { Layout } from '../core/components/index';
import { TransferUsdt } from '../features/transactions/index';

export const TransferUsdtPage = () => (
    <Layout
        title="Transfer USDT"
        subtitle="Sign a jetton transfer of USDT from your wallet directly via TonConnect."
    >
        <TransferUsdt />
    </Layout>
);
