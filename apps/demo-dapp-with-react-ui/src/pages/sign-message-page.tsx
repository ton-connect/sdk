import { Layout } from '../core/components/index';
import { TON_CONNECT_DOCS } from '../core/config/demo-nav';
import { DEMO_SOURCE_LINKS } from '../core/config/demo-source-links';
import { SignMessage } from '../features/transactions';

export const SignMessagePage = () => (
    <Layout
        title="Sign message"
        docHref={TON_CONNECT_DOCS.signMessage}
        sourceHref={DEMO_SOURCE_LINKS.signMessage}
        subtitle="Build a signMessage request — pick a preset, set valid-until, edit the JSON, and sign it via TonConnect."
        data-testid="sign-message-page"
    >
        <SignMessage />
    </Layout>
);
