import { Layout } from '@/core/components';
import { TransferUsdt } from '@/features/transactions';

export const TransferUsdtPage = () => (
    <Layout title="Transfer USDT">
        <div
            className="mx-auto flex w-full max-w-[434px] flex-col"
            data-testid="transfer-usdt-page"
        >
            <p
                className="text-[15px] leading-relaxed text-secondary-foreground"
                data-testid="transfer-usdt-page-subtitle"
            >
                Sign a jetton transfer of USDT from your wallet directly via TonConnect.
            </p>
            <TransferUsdt />
        </div>
    </Layout>
);
