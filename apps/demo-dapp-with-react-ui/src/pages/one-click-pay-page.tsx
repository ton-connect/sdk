import { Layout } from '@/core/components';
import { OneClickPay } from '@/features/one-click-pay';

export const OneClickPayPage = () => (
    <Layout
        title="One-click pay"
        subtitle="Single-button gasless USDT payment — connect, sign, relay, and wait for on-chain confirmation."
    >
        <OneClickPay />
    </Layout>
);
