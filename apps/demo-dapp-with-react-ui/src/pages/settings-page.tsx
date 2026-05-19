import { Layout } from '@/core/components';
import { DevPanel } from '@/features/dev-settings';

export const SettingsPage = () => (
    <Layout
        title="Settings"
        subtitle="Tweak TonConnect UI runtime options — language, theme, border radius, modal/notification triggers, and colors."
    >
        <DevPanel />
    </Layout>
);
