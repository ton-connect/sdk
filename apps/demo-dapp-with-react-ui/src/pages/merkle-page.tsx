import { Layout } from '../core/components/index';
import { MerkleExample } from '../features/utilities/index';

export const MerklePage = () => (
    <Layout
        title="Merkle proof"
        subtitle="Send a transaction containing a merkle proof or merkle update exotic cell to the example contract."
    >
        <MerkleExample />
    </Layout>
);
