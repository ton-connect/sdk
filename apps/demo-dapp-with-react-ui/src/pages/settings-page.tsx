import { Layout } from '../core/components/index';
import { DevPanel } from '../features/dev-settings/index';

export const SettingsPage = () => (
    <Layout title="Settings" data-testid="settings-page">
        <DevPanel />
    </Layout>
);
