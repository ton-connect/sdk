import { Layout } from '../core/components/index';
import { TON_CONNECT_DOCS } from '../core/config/demo-nav';
import { DEMO_SOURCE_LINKS } from '../core/config/demo-source-links';
import { SignData } from '../features/signing/index';

export const SignDataPage = () => (
    <Layout
        title="Sign data"
        docHref={TON_CONNECT_DOCS.signData}
        sourceHref={DEMO_SOURCE_LINKS.signData}
        subtitle="Test wallet signature requests with text, binary, and cell payloads, and verify the result against the demo backend."
        data-testid="sign-data-page"
    >
        <SignData />
    </Layout>
);
