import { Layout } from '../core/components/index';
import { TON_CONNECT_DOCS } from '../core/config/demo-nav';
import { DEMO_SOURCE_LINKS } from '../core/config/demo-source-links';
import { TransferUsdt } from '../features/transactions/index';

export const TransferUsdtPage = () => (
    <Layout
        title="Transfer USDT"
        docHref={TON_CONNECT_DOCS.gasless}
        sourceHref={DEMO_SOURCE_LINKS.transferUsdt}
        data-testid="transfer-usdt-page"
    >
        <p
            className="text-[15px] leading-relaxed text-secondary-foreground"
            data-testid="transfer-usdt-page-subtitle"
        >
            Pay USDT from your wallet via TonConnect. Toggle gasless relay in settings, or embed
            the transfer in connect for a one-tap flow.
        </p>
        <TransferUsdt />
    </Layout>
);
