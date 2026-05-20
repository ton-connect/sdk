import { Layout } from '../core/components/index';
import { SignData } from '../features/signing/index';

export const SignDataPage = () => (
    <Layout
        title="Sign data"
        subtitle="Test wallet signature requests with text, binary, and cell payloads, and verify the result against the demo backend."
        data-testid="sign-data-page"
    >
        <SignData />
    </Layout>
);
