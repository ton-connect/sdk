import { TonConnectButton, useTonWallet } from '@tonconnect/ui-react';
import { BookOpen, ExternalLink, Github, Settings } from 'lucide-react';
import { Link, NavLink } from 'react-router-dom';
import type { ComponentType, FC, ReactNode } from 'react';

import { DEMO_NAV_GROUPS, TON_CONNECT_DOCS } from '../../../config/demo-nav';
import { BalanceCard } from '../../../../features/wallet';
import { usePreserveSearch } from '../../../hooks/use-preserve-search';

import { PageHeading } from './page-heading';
import { SidebarNavItem } from './sidebar-nav-item';

import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarGroup,
    SidebarGroupLabel,
    SidebarHeader,
    SidebarInset,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
    SidebarProvider,
    SidebarSeparator,
    SidebarTrigger,
    useSidebar
} from '../../shared/sidebar/index';
import { AppLogo } from '../app-logo';
import { ThemeSwitcher } from '../theme-switcher/index';

interface LayoutProps {
    children: ReactNode;
    title?: string | ReactNode;
    /** How-to doc opened from the page title (desktop header + mobile title row). */
    docHref?: string;
    /** Demo feature source on GitHub (ton-connect/sdk monorepo). */
    sourceHref?: string;
    subtitle?: ReactNode;
    /** Stable test id applied to the `<main>` content element. */
    'data-testid'?: string;
}

const EXTERNAL_LINKS: readonly {
    href: string;
    label: string;
    icon: ComponentType<{ className?: string }>;
}[] = [
    {
        href: TON_CONNECT_DOCS.overview,
        label: 'Docs',
        icon: BookOpen
    },
    { href: 'https://github.com/ton-connect/sdk', label: 'GitHub', icon: Github }
];

const AppSidebar: FC = () => {
    const { setOpenMobile, isMobile } = useSidebar();
    const withSearch = usePreserveSearch();
    const wallet = useTonWallet();

    const closeOnMobile = () => {
        if (isMobile) setOpenMobile(false);
    };

    return (
        <Sidebar>
            <SidebarHeader>
                <Link
                    to={withSearch('/tx-form')}
                    onClick={closeOnMobile}
                    className="flex items-center gap-2 px-2 py-1.5"
                >
                    <AppLogo className="size-7" />
                    <span className="text-base font-bold text-foreground">TON Connect Demo</span>
                </Link>
            </SidebarHeader>

            <SidebarContent>
                {wallet && (
                    <>
                        <SidebarGroup>
                            <BalanceCard />
                        </SidebarGroup>

                        <SidebarSeparator />
                    </>
                )}

                {DEMO_NAV_GROUPS.map(group => (
                    <SidebarGroup key={group.label}>
                        <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
                        <SidebarMenu>
                            {group.links.map(link => (
                                <SidebarNavItem
                                    key={link.to}
                                    link={link}
                                    to={withSearch(link.to)}
                                    onNavigate={closeOnMobile}
                                />
                            ))}
                        </SidebarMenu>
                    </SidebarGroup>
                ))}
            </SidebarContent>

            <SidebarSeparator />

            <SidebarFooter>
                <SidebarMenu>
                    {EXTERNAL_LINKS.map(({ href, label, icon: Icon }) => (
                        <SidebarMenuItem key={href}>
                            <SidebarMenuButton asChild>
                                <a href={href} target="_blank" rel="noreferrer">
                                    <Icon />
                                    <span>{label}</span>
                                    <ExternalLink className="ml-auto text-tertiary-foreground" />
                                </a>
                            </SidebarMenuButton>
                        </SidebarMenuItem>
                    ))}
                    <SidebarMenuItem>
                        <NavLink to={withSearch('/settings')} end onClick={closeOnMobile}>
                            {({ isActive }) => (
                                <SidebarMenuButton isActive={isActive}>
                                    <Settings />
                                    <span>Settings</span>
                                </SidebarMenuButton>
                            )}
                        </NavLink>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
};

export const Layout: FC<LayoutProps> = ({
    children,
    title,
    docHref,
    sourceHref,
    subtitle,
    'data-testid': testId
}) => {
    return (
        <SidebarProvider>
            <AppSidebar />

            <SidebarInset>
                <header
                    data-app-chrome-header
                    className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-tertiary bg-background/80 px-4 backdrop-blur"
                >
                    <AppLogo className="size-8 md:hidden" />
                    {title != null && (
                        <div className="hidden min-w-0 md:flex md:items-center">
                            <PageHeading title={title} docHref={docHref} sourceHref={sourceHref} />
                        </div>
                    )}

                    <div className="ml-auto">
                        <TonConnectButton />
                    </div>
                    <ThemeSwitcher />
                    <div className="md:hidden">
                        <SidebarTrigger />
                    </div>
                </header>

                <main className="mx-auto w-full max-w-4xl flex-1 p-4" data-testid={testId}>
                    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 py-2 md:py-6">
                        {title != null && (
                            <div className="flex w-full items-baseline justify-start md:hidden">
                                <PageHeading
                                    title={title}
                                    docHref={docHref}
                                    sourceHref={sourceHref}
                                    className="flex w-full min-w-0 items-baseline gap-1.5"
                                />
                            </div>
                        )}
                        {subtitle && (
                            <p className="text-[15px] leading-relaxed text-secondary-foreground">
                                {subtitle}
                            </p>
                        )}
                        {children}
                    </div>
                </main>

                <footer className="pb-4 pt-2 text-center text-xs text-tertiary-foreground">
                    <p>Powered by TON Connect</p>
                </footer>
            </SidebarInset>
        </SidebarProvider>
    );
};
