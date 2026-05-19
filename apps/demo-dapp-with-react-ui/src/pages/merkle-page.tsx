import { Layout } from '@/core/components';
import { MerkleExample } from '@/features/utilities';

export const MerklePage = () => (
    <Layout
        title="Merkle proof"
        subtitle="Send a transaction containing a merkle proof or merkle update exotic cell to the example contract."
    >
        <MerkleExample />
    </Layout>
);
