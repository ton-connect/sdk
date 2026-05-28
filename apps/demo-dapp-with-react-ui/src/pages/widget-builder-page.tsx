import { Layout } from '../core/components/index';
import { TON_CONNECT_DOCS } from '../core/config/demo-nav';
import { WidgetBuilder } from '../features/widget-builder';

export const WidgetBuilderPage = () => (
    <Layout
        title="Widget builder"
        subtitle="Configure a TON Connect widget visually, preview it live, and export ready-to-use snippets."
        docHref={TON_CONNECT_DOCS.connect}
        data-testid="widget-builder-page"
        wide
        hideFooter
    >
        <WidgetBuilder />
    </Layout>
);
