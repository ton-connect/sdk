import { Layout } from '../core/components/index';
import { TON_CONNECT_DOCS } from '../core/config/demo-nav';
import { TonProof } from '../features/signing/index';

export const TonProofPage = () => (
    <Layout title="Ton proof" docHref={TON_CONNECT_DOCS.tonProof} data-testid="ton-proof-page">
        <div className="mx-auto flex w-full max-w-[534px] gap-5 flex-col">
            <p
                className="text-[15px] leading-relaxed text-secondary-foreground"
                data-testid="ton-proof-page-subtitle"
            >
                Authenticate the connected wallet against the demo backend using ton_proof signature
                verification.
            </p>
            <TonProof />
        </div>
    </Layout>
);
