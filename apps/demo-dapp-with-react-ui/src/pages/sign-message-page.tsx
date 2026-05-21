import { Layout } from '../core/components/index';
import { TON_CONNECT_DOCS } from '../core/config/demo-nav';
import { SignMessage } from '../features/transactions';

export const SignMessagePage = () => (
    <Layout
        title="Sign message"
        docHref={TON_CONNECT_DOCS.signMessage}
        subtitle="Build a signMessage request — pick a preset, set valid-until, edit the JSON, and sign it via TonConnect."
        data-testid="sign-message-page"
    >
        <SignMessage />
    </Layout>
);
