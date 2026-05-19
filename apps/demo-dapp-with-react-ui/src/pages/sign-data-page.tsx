import { Layout } from '@/core/components';
import { SignDataTester } from '@/features/signing';

export const SignDataPage = () => (
    <Layout
        title="Sign data"
        subtitle="Test wallet signature requests with text, binary, and cell payloads, and verify the result against the demo backend."
    >
        <SignDataTester />
    </Layout>
);
