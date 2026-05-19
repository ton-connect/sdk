import type { ReactNode } from 'react';

import { Header } from '@/core/components/layout/header';
import { DevPanel } from '@/features/dev-settings';

interface LayoutProps {
    children: ReactNode;
}

export const Layout = ({ children }: LayoutProps) => {
    return (
        <div className="flex min-h-full flex-col [&>header]:mb-[10px]">
            <Header />
            {children}
            <DevPanel />
        </div>
    );
};
