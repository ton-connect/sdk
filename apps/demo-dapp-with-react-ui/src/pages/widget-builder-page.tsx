import { Layout } from '../core/components/index';
import { TON_CONNECT_DOCS } from '../core/config/demo-nav';
import { WidgetBuilder } from '../features/widget-builder';

export const WidgetBuilderPage = () => (
    <Layout
        docHref={TON_CONNECT_DOCS.connect}
        data-testid="widget-builder-page"
        wide
        hideHeader
        hideFooter
        contentClassName="flex h-dvh max-h-dvh min-h-0 max-w-none flex-1 flex-col overflow-hidden p-0"
        contentInnerClassName="flex h-full min-h-0 max-h-full flex-1 flex-col max-w-none gap-0 py-0 md:py-0"
    >
        <WidgetBuilder />
    </Layout>
);
