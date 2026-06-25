import { TonConnectButton, useTonWallet } from '@tonconnect/ui-react';
import { BookOpen, ChevronLeft, ChevronRight, ExternalLink, Settings } from 'lucide-react';
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
    SidebarTooltip,
    SidebarProvider,
    SidebarSeparator,
    SidebarTrigger,
    useSidebar
} from '../../shared/sidebar/index';
import { Button } from '../../ui/button';
import { GitHubIcon } from '../../ui/icons';
import { AppLogo } from '../app-logo';
import { ThemeSwitcher } from '../theme-switcher/index';
import { cn } from '../../../utils/cn';

interface LayoutProps {
    children: ReactNode;
    title?: string | ReactNode;
    /** How-to doc opened from the page title (desktop header + mobile title row). */
    docHref?: string;
    /** Demo feature source on GitHub (ton-connect/sdk monorepo). */
    sourceHref?: string;
    subtitle?: ReactNode;
    wide?: boolean;
    hideHeader?: boolean;
    hideFooter?: boolean;
    contentClassName?: string;
    contentInnerClassName?: string;
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
    { href: 'https://github.com/ton-connect/sdk', label: 'GitHub', icon: GitHubIcon }
];

const AppSidebar: FC = () => {
    const { setOpenMobile, isMobile, open, toggleSidebar } = useSidebar();
    const withSearch = usePreserveSearch();
    const wallet = useTonWallet();
    const collapsed = !isMobile && !open;

    const closeOnMobile = () => {
        if (isMobile) setOpenMobile(false);
    };

    return (
        <Sidebar>
            <SidebarHeader>
                <Link
                    to={withSearch('/tx-form')}
                    onClick={closeOnMobile}
                    className={cn(
                        'flex h-10 items-center gap-2 px-2 py-1.5 transition-[width,padding] duration-200 ease-out',
                        collapsed && 'mx-auto !w-12 justify-center !gap-0 !px-0'
                    )}
                    title="TON Connect Demo"
                >
                    <AppLogo className="size-7" />
                    <span
                        className={cn(
                            'min-w-0 overflow-hidden whitespace-nowrap text-base font-bold text-foreground transition-[max-width,opacity] duration-200 ease-out',
                            collapsed ? 'max-w-0 opacity-0' : 'max-w-56 opacity-100'
                        )}
                    >
                        TON Connect Demo
                    </span>
                </Link>
            </SidebarHeader>

            <SidebarContent>
                {wallet && (
                    <div
                        className={cn(
                            'overflow-hidden transition-[max-height,opacity] duration-200 ease-out',
                            collapsed ? 'max-h-0 opacity-0' : 'max-h-40 opacity-100'
                        )}
                    >
                        <SidebarGroup className={cn(collapsed && 'pointer-events-none')}>
                            <BalanceCard />
                        </SidebarGroup>

                        <SidebarSeparator />
                    </div>
                )}

                {DEMO_NAV_GROUPS.map(group => (
                    <SidebarGroup key={group.label}>
                        <SidebarGroupLabel
                            className={cn(
                                'transition-opacity duration-200 ease-out',
                                collapsed && 'opacity-0'
                            )}
                        >
                            {group.label}
                        </SidebarGroupLabel>
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
                        <SidebarMenuItem key={href} className="group">
                            <SidebarMenuButton asChild>
                                <a
                                    href={href}
                                    target="_blank"
                                    rel="noreferrer"
                                    aria-label={label}
                                    title={label}
                                    className={cn(
                                        collapsed && 'mx-auto !w-12 justify-center !gap-0 !px-0'
                                    )}
                                >
                                    <Icon />
                                    <span
                                        className={cn(
                                            'min-w-0 overflow-hidden whitespace-nowrap transition-[max-width,opacity] duration-200 ease-out',
                                            collapsed ? 'max-w-0 opacity-0' : 'max-w-32 opacity-100'
                                        )}
                                    >
                                        {label}
                                    </span>
                                    {!collapsed ? (
                                        <ExternalLink className="ml-auto text-tertiary-foreground transition-opacity duration-200 ease-out" />
                                    ) : null}
                                </a>
                            </SidebarMenuButton>
                            {collapsed ? <SidebarTooltip>{label}</SidebarTooltip> : null}
                        </SidebarMenuItem>
                    ))}
                    <SidebarMenuItem className="group">
                        <NavLink to={withSearch('/settings')} end onClick={closeOnMobile}>
                            {({ isActive }) => (
                                <SidebarMenuButton
                                    isActive={isActive}
                                    aria-label="Ton Connect settings"
                                    title="Ton Connect settings"
                                    className={cn(
                                        collapsed && 'mx-auto !w-12 justify-center !gap-0 !px-0'
                                    )}
                                >
                                    <Settings />
                                    <span
                                        className={cn(
                                            'min-w-0 overflow-hidden whitespace-nowrap transition-[max-width,opacity] duration-200 ease-out',
                                            collapsed ? 'max-w-0 opacity-0' : 'max-w-48 opacity-100'
                                        )}
                                    >
                                        Ton Connect settings
                                    </span>
                                </SidebarMenuButton>
                            )}
                        </NavLink>
                        {collapsed ? <SidebarTooltip>Ton Connect settings</SidebarTooltip> : null}
                    </SidebarMenuItem>
                </SidebarMenu>
                {!isMobile ? (
                    <div className="flex flex-col gap-1">
                        <SidebarSeparator />
                        <div className="group relative">
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                onClick={toggleSidebar}
                                className={cn(
                                    'h-7 justify-center transition-[width] duration-200 ease-out',
                                    collapsed ? 'mx-auto !h-7 !w-12 !gap-0' : 'w-full'
                                )}
                                aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                                title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                            >
                                {collapsed ? (
                                    <ChevronRight className="size-4" />
                                ) : (
                                    <ChevronLeft className="size-4" />
                                )}
                            </Button>
                            {collapsed ? <SidebarTooltip>Expand sidebar</SidebarTooltip> : null}
                        </div>
                    </div>
                ) : null}
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
    wide = false,
    hideHeader = false,
    hideFooter = false,
    contentClassName,
    contentInnerClassName,
    'data-testid': testId
}) => {
    return (
        <SidebarProvider>
            <AppSidebar />

            <SidebarInset>
                {!hideHeader ? (
                    <header
                        data-app-chrome-header
                        className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-tertiary bg-background/80 px-4 backdrop-blur"
                    >
                        <AppLogo className="size-8 md:hidden" />
                        {title != null && (
                            <div className="hidden min-w-0 md:flex md:items-center">
                                <PageHeading
                                    title={title}
                                    docHref={docHref}
                                    sourceHref={sourceHref}
                                />
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
                ) : null}

                <main
                    className={cn(
                        'mx-auto flex min-h-0 w-full flex-1 flex-col p-4',
                        wide ? 'max-w-7xl' : 'max-w-4xl',
                        contentClassName
                    )}
                    data-testid={testId}
                >
                    <div
                        className={cn(
                            'mx-auto flex w-full flex-col gap-6 py-2 md:py-6',
                            wide ? 'max-w-none' : 'max-w-2xl',
                            contentInnerClassName
                        )}
                    >
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

                {!hideFooter ? (
                    <footer className="pb-4 pt-2 text-center text-xs text-tertiary-foreground">
                        <p>Powered by TON Connect</p>
                    </footer>
                ) : null}
            </SidebarInset>
        </SidebarProvider>
    );
};
