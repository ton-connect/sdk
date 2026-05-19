import { Layout } from '@/core/components';
import { GaslessDemo } from '@/features/transactions';

export const GaslessPage = () => (
    <Layout
        title="Gasless USDT"
        subtitle="Transfer jettons without TON in the wallet — the relay fee is paid in the same jetton."
    >
        <GaslessDemo />
    </Layout>
);
