import { Layout } from '../core/components/index';
import { TON_CONNECT_DOCS } from '../core/config/demo-nav';
import { ExportSandbox } from '../features/widget-builder';

export const WidgetSandboxPage = () => (
    <Layout
        title="Export sandbox"
        subtitle="Paste a generated TON Connect widget snippet and verify how it mounts in a standalone dapp frame."
        docHref={TON_CONNECT_DOCS.connect}
        data-testid="widget-sandbox-page"
        wide
        hideFooter
    >
        <ExportSandbox />
    </Layout>
);
