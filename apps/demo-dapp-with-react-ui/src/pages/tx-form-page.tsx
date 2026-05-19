import { Layout } from '@/core/components';
import { TxForm } from '@/features/transactions';

export const TxFormPage = () => (
    <Layout
        title="Send transaction"
        subtitle="Configure a TON transaction payload and send it via TonConnect, optionally embedding the request inside the connect URL."
    >
        <TxForm />
    </Layout>
);
