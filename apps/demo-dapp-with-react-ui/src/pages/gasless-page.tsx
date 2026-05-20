import { Layout } from '../core/components/index';
import { Gasless } from '../features/transactions/index';

export const GaslessPage = () => (
    <Layout title="Gasless USDT">
        <div className="mx-auto flex w-full max-w-[434px] flex-col" data-testid="gasless-page">
            <p
                className="text-[15px] leading-relaxed text-secondary-foreground"
                data-testid="gasless-page-subtitle"
            >
                Transfer jettons without TON in the wallet — the relay fee is paid in the same
                jetton.
            </p>
            <Gasless />
        </div>
    </Layout>
);
