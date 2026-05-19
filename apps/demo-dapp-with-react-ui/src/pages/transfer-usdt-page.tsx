import { Layout } from '@/core/components';
import { TransferUsdt } from '@/features/transactions';

export const TransferUsdtPage = () => (
    <Layout
        title="Transfer USDT"
        subtitle="Sign a jetton transfer of USDT from your wallet directly via TonConnect."
    >
        <TransferUsdt />
    </Layout>
);
