import { Layout } from '@/core/components';
import { DevPanel } from '@/features/dev-settings';

export const SettingsPage = () => (
    <Layout title="Settings" subtitle="Configure TonConnect UI">
        <DevPanel />
    </Layout>
);
