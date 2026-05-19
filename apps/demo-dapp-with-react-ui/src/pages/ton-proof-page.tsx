import { Layout } from '@/core/components';
import { TonProofDemo } from '@/features/signing';

export const TonProofPage = () => (
    <Layout
        title="Ton proof"
        subtitle="Authenticate the connected wallet against the demo backend using ton_proof signature verification."
    >
        <TonProofDemo />
    </Layout>
);
