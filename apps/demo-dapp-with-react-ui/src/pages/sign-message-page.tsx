import { Layout } from '../core/components/index';
import { SignMessage } from '../features/transactions';

export const SignMessagePage = () => (
    <Layout
        title="Sign message"
        subtitle="Build a signMessage request — pick a preset, set valid-until, edit the JSON, and sign it via TonConnect."
        data-testid="sign-message-page"
    >
        <SignMessage />
    </Layout>
);
