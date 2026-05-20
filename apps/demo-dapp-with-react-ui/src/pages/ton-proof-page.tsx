import { Layout } from '../core/components/index';
import { TonProofDemo } from '../features/signing/index';

export const TonProofPage = () => (
    <Layout
        title="Ton proof"
        subtitle="Authenticate the connected wallet against the demo backend using ton_proof signature verification."
    >
        <TonProofDemo />
    </Layout>
);
