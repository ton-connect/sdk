import { Layout } from '../core/components/index';
import { FindTx } from '../features/utilities/index';

export const FindTxPage = () => (
    <Layout title="Find transaction" data-testid="find-tx-page">
        <div className="mx-auto flex w-full max-w-[534px] gap-5 flex-col">
            <p
                className="text-[15px] leading-relaxed text-secondary-foreground"
                data-testid="find-tx-page-subtitle"
            >
                Look up the on-chain transaction that corresponds to an external-in message BOC.
            </p>
            <FindTx />
        </div>
    </Layout>
);
