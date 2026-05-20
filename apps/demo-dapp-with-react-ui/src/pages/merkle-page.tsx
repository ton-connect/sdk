import { Layout } from '../core/components/index';
import { Merkle } from '../features/utilities/index';

export const MerklePage = () => (
    <Layout title="Merkle proof" data-testid="merkle-page">
        <div className="mx-auto flex w-full max-w-[534px] gap-5 flex-col">
            <p
                className="text-[15px] leading-relaxed text-secondary-foreground"
                data-testid="merkle-page-subtitle"
            >
                Send a transaction containing a merkle proof or merkle update exotic cell to the
                example contract.
            </p>
            <Merkle />
        </div>
    </Layout>
);
