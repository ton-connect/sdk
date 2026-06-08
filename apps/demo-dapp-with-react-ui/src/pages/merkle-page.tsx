import { Layout } from '../core/components/index';
import { DEMO_SOURCE_LINKS } from '../core/config/demo-source-links';
import { Merkle } from '../features/utilities/index';

export const MerklePage = () => (
    <Layout title="Merkle proof" sourceHref={DEMO_SOURCE_LINKS.merkle} data-testid="merkle-page">
        <p
            className="text-[15px] leading-relaxed text-secondary-foreground"
            data-testid="merkle-page-subtitle"
        >
            Send a transaction containing a merkle proof or merkle update exotic cell to the example
            contract.
        </p>
        <Merkle />
    </Layout>
);
