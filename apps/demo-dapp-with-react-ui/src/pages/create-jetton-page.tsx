import { Layout } from '../core/components/index';
import { CreateJettonDemo } from '../features/utilities/index';

export const CreateJettonPage = () => (
    <Layout title="Create jetton">
        <div
            className="mx-auto flex w-full max-w-[434px] flex-col"
            data-testid="create-jetton-page"
        >
            <p
                className="text-[15px] leading-relaxed text-secondary-foreground"
                data-testid="create-jetton-page-subtitle"
            >
                Deploy the demo JPEG jetton and mint the initial supply via the protected
                backend, then sign the transaction in your wallet.
            </p>
            <CreateJettonDemo />
        </div>
    </Layout>
);
