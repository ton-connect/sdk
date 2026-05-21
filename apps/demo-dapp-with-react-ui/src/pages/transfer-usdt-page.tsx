import { Layout } from '../core/components/index';
import { TON_CONNECT_DOCS } from '../core/config/demo-nav';
import { TransferUsdt } from '../features/transactions/index';

export const TransferUsdtPage = () => (
    <Layout
        title="Transfer USDT"
        docHref={TON_CONNECT_DOCS.gasless}
        data-testid="transfer-usdt-page"
    >
        <div className="mx-auto flex w-full max-w-[434px] flex-col">
            <p
                className="text-[15px] leading-relaxed text-secondary-foreground"
                data-testid="transfer-usdt-page-subtitle"
            >
                Pay USDT from your wallet via TonConnect. Toggle gasless relay in settings, or embed
                the transfer in connect for a one-tap flow.
            </p>
            <TransferUsdt />
        </div>
    </Layout>
);
