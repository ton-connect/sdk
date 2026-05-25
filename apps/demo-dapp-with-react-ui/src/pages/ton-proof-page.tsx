import { Layout } from '../core/components/index';
import { TON_CONNECT_DOCS } from '../core/config/demo-nav';
import { DEMO_SOURCE_LINKS } from '../core/config/demo-source-links';
import { TonProof } from '../features/signing/index';

export const TonProofPage = () => (
    <Layout
        title="Ton proof"
        docHref={TON_CONNECT_DOCS.tonProof}
        sourceHref={DEMO_SOURCE_LINKS.tonProof}
        data-testid="ton-proof-page"
    >
        <p
            className="text-[15px] leading-relaxed text-secondary-foreground"
            data-testid="ton-proof-page-subtitle"
        >
            Authenticate the connected wallet against the demo backend using ton_proof signature
            verification.
        </p>
        <TonProof />
    </Layout>
);
